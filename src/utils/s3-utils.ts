import { env } from '~/env/server.mjs';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  PutBucketCorsCommand,
  GetObjectCommandInput,
  HeadObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getDeliveryWorkerStatus } from './delivery-worker';

const missingEnvs = (): string[] => {
  const keys = [];
  if (!env.S3_UPLOAD_KEY) {
    keys.push('S3_UPLOAD_KEY');
  }
  if (!env.S3_UPLOAD_SECRET) {
    keys.push('S3_UPLOAD_SECRET');
  }
  if (!env.S3_UPLOAD_ENDPOINT) {
    keys.push('S3_UPLOAD_ENDPOINT');
  }
  if (!env.S3_UPLOAD_BUCKET) {
    keys.push('S3_UPLOAD_BUCKET');
  }
  return keys;
};

export async function setCors(s3: S3Client | null = null) {
  if (!s3) s3 = await getS3Client();
  await s3.send(
    new PutBucketCorsCommand({
      Bucket: env.S3_UPLOAD_BUCKET,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ['content-type'],
            ExposeHeaders: ['ETag'],
            AllowedMethods: ['PUT', 'GET'],
            AllowedOrigins: env.S3_ORIGINS ? env.S3_ORIGINS : ['*'],
          },
        ],
      },
    })
  );
}

export function getS3Client() {
  const missing = missingEnvs();
  if (missing.length > 0) throw new Error(`Next S3 Upload: Missing ENVs ${missing.join(', ')}`);

  return new S3Client({
    credentials: {
      accessKeyId: env.S3_UPLOAD_KEY,
      secretAccessKey: env.S3_UPLOAD_SECRET,
    },
    region: env.S3_UPLOAD_REGION,
    endpoint: env.S3_UPLOAD_ENDPOINT,
    forcePathStyle: env.S3_FORCE_PATH_STYLE,
  });
}

export async function getPutUrl(key: string, s3: S3Client | null = null) {
  // const deliveryWorkerStatus = await getDeliveryWorkerStatus();
  // const bucket = deliveryWorkerStatus.current?.name ?? env.S3_UPLOAD_BUCKET;
  const bucket = env.S3_UPLOAD_BUCKET;
  return getCustomPutUrl(bucket, key, s3);
}

export async function getCustomPutUrl(bucket: string, key: string, s3: S3Client | null = null) {
  if (!s3) s3 = getS3Client();
  const url = await getSignedUrl(s3, new PutObjectCommand({ Bucket: bucket, Key: key }), {
    expiresIn: UPLOAD_EXPIRATION,
  });
  return { url, bucket, key };
}

export function deleteObject(bucket: string, key: string, s3: S3Client | null = null) {
  if (!s3) s3 = getS3Client();
  return s3.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}

const DOWNLOAD_EXPIRATION = 60 * 60 * 24; // 24 hours
const UPLOAD_EXPIRATION = 60 * 60 * 12; // 12 hours
const FILE_CHUNK_SIZE = 10 * 1024 * 1024; // 10 MB
export async function getMultipartPutUrl(key: string, size: number, s3: S3Client | null = null) {
  if (!s3) s3 = getS3Client();
  // Removed for testing
  // const deliveryWorkerStatus = await getDeliveryWorkerStatus();
  // const bucket = deliveryWorkerStatus.current?.name ?? env.S3_UPLOAD_BUCKET;
  const bucket = env.S3_UPLOAD_BUCKET;
  const { UploadId } = await s3.send(
    new CreateMultipartUploadCommand({ Bucket: bucket, Key: key })
  );

  const promises = [];
  for (let i = 0; i < Math.ceil(size / FILE_CHUNK_SIZE); i++) {
    promises.push(
      getSignedUrl(
        s3,
        new UploadPartCommand({ Bucket: bucket, Key: key, UploadId, PartNumber: i + 1 }),
        { expiresIn: UPLOAD_EXPIRATION }
      ).then((url) => ({ url, partNumber: i + 1 }))
    );
  }
  const urls = await Promise.all(promises);

  return { urls, bucket, key, uploadId: UploadId };
}

interface MultipartUploadPart {
  ETag: string;
  PartNumber: number;
}
export function completeMultipartUpload(
  bucket: string,
  key: string,
  uploadId: string,
  parts: MultipartUploadPart[],
  s3: S3Client | null = null
) {
  if (!s3) s3 = getS3Client();
  return s3.send(
    new CompleteMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: { Parts: parts },
    })
  );
}

export async function abortMultipartUpload(
  bucket: string,
  key: string,
  uploadId: string,
  s3: S3Client | null = null
) {
  if (!s3) s3 = getS3Client();
  await s3.send(
    new AbortMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
    })
  );
}

type GetObjectOptions = {
  s3?: S3Client | null;
  expiresIn?: number;
  fileName?: string;
  bucket?: string;
};

const buckets = [env.S3_UPLOAD_BUCKET, env.S3_SETTLED_BUCKET];
const keyParser = new RegExp(`https:\\/\\/([\\w\\-]*)\\.?${env.CF_ACCOUNT_ID}.*?\\/(.+)`, 'i');
export function parseKey(key: string) {
  if (env.S3_FORCE_PATH_STYLE) {
    // e.g. key: https://s3.region.s3originsite.com/bucket/key
    const url = new URL(key);
    const [bucket, ...keyParts] = url.pathname.split('/').filter(Boolean);
    return { key: keyParts.join('/'), bucket };
  }
  // e.g. key: https://bucket.s3.region.s3originsite.com/key
  let bucket = null;
  if (key.startsWith('http')) [, bucket, key] = keyParser.exec(key) ?? [, null, key];
  for (const b of buckets) {
    if (!key.startsWith(b + '/')) continue;
    bucket = b;
    key = key.replace(`${bucket}/`, '');
    break;
  }

  return { key, bucket };
}

export async function getGetUrl(
  key: string,
  { s3, expiresIn = DOWNLOAD_EXPIRATION, fileName, bucket }: GetObjectOptions = {}
) {
  if (!s3) s3 = getS3Client();

  const { key: parsedKey, bucket: parsedBucket } = parseKey(key);
  if (!bucket) bucket = parsedBucket ?? env.S3_UPLOAD_BUCKET;
  const command: GetObjectCommandInput = {
    Bucket: bucket,
    Key: parsedKey,
  };
  if (fileName) command.ResponseContentDisposition = `attachment; filename="${fileName}"`;

  const url = await getSignedUrl(s3, new GetObjectCommand(command), { expiresIn });
  return { url, bucket, key };
}

export async function checkFileExists(key: string, s3: S3Client | null = null) {
  if (!s3) s3 = getS3Client();

  try {
    const { key: parsedKey, bucket: parsedBucket } = parseKey(key);
    await s3.send(
      new HeadObjectCommand({
        Key: parsedKey,
        Bucket: parsedBucket ?? env.S3_UPLOAD_BUCKET,
      })
    );
  } catch {
    return false;
  }

  return true;
}
