import { NextApiRequest, NextApiResponse } from 'next';
import { UploadType } from '~/server/common/enums';
import { extname } from 'node:path';
import { filenamize, generateToken } from '~/utils/string-helpers';
import { getMultipartPutUrl } from '~/utils/s3-utils';
import { logToDb } from '~/utils/logging';

const uploadSeed = async (req: NextApiRequest, res: NextApiResponse) => {
  const { filename: fullFilename, userId } = req.body;
  const ext = extname(fullFilename);
  const filename = filenamize(fullFilename.replace(ext, ''));
  let { type } = req.body;
  if (!type || !Object.values(UploadType).includes(type)) type = UploadType.Default;

  const key = `${userId}/${type ?? UploadType.Default}/${filename}.${generateToken(4)}${ext}`;
  const result = await getMultipartPutUrl(key, req.body.size);
  await logToDb('s3-upload', {
    userId,
    type,
    filename: fullFilename,
    key,
    uploadId: result.uploadId,
    bucket: result.bucket,
  });

  res.status(200).json(result);
};

export default uploadSeed;
