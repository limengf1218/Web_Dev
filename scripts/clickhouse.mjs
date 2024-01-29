import { createClient } from '@clickhouse/client';
import dotenv from 'dotenv';
import path from 'path';

// Determine the script's directory
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Specify the custom path to the .env file
const envFilePath = path.join(__dirname, '../.env');

// Load environment variables from the custom .env file
dotenv.config({ path: envFilePath });

const clickhouseUrl = process.env.CLICKHOUSE_HOST;
const clickhouseusr = process.env.CLICKHOUSE_USERNAME;
const clickhousepwd = process.env.CLICKHOUSE_PASSWORD;

if (!clickhouseUrl || !clickhouseusr) {
  console.error('Please provide a valid CLICKHOUSE variables in your .env file.');
  process.exit(1);
}

const client =  createClient({
  host: clickhouseUrl,
  username: clickhouseusr,
  password: clickhousepwd
});

const comments = [
  // Your CREATE TABLE statements here
    "CREATE TABLE IF NOT EXISTS default.views (type String,entityType String,entityId Int64, time DateTime default now()) ENGINE = MergeTree()ORDER BY entityId;",
    "CREATE TABLE IF NOT EXISTS default.modelEvents (type String,modelId Int64,nsfw UInt8) ENGINE = MergeTree()ORDER BY modelId;",
    "CREATE TABLE IF NOT EXISTS default.modelVersionEvents (type String,modelId Int64,modelVersionId Int64,nsfw UInt8,time DateTime default now()) ENGINE = MergeTree()ORDER BY modelVersionId;",
    "CREATE TABLE IF NOT EXISTS default.partnerEvents (type String,partnerId Int64, modelId Nullable(Int64), modelVersionId Nullable(Int64),nsfw Nullable(UInt8)) ENGINE = MergeTree()ORDER BY partnerId;",
    "CREATE TABLE IF NOT EXISTS default.userActivities (type String,targetUserId Int64) ENGINE = MergeTree()ORDER BY targetUserId;",
    "CREATE TABLE IF NOT EXISTS default.resourceReviews (type String, modelId Int64, modelVersionId Int64, nsfw UInt8, rating Float32, time DateTime default now()) ENGINE = MergeTree()ORDER BY modelId;",
    "CREATE TABLE IF NOT EXISTS default.reactions (type String,entityId Int64, reaction String, nsfw String) ENGINE = MergeTree()ORDER BY entityId;",
    "CREATE TABLE IF NOT EXISTS default.questions (type String,questionId Int64) ENGINE = MergeTree()ORDER BY questionId;",
    "CREATE TABLE IF NOT EXISTS default.answers (type String,questionId Int64,answerId Int64) ENGINE = MergeTree()ORDER BY answerId;",
    "CREATE TABLE IF NOT EXISTS default.comments ( type String,entityId Int64, nsfw UInt8, time DateTime default now()) ENGINE = MergeTree()ORDER BY entityId;",
    "CREATE TABLE IF NOT EXISTS default.posts (type String,postId Int64, nsfw UInt8, tags Array(String)) ENGINE = MergeTree()ORDER BY postId;",
    "CREATE TABLE IF NOT EXISTS default.images (type String, imageId Int64, nsfw String, tags Array(String)) ENGINE = MergeTree()ORDER BY imageId;",
    "CREATE TABLE IF NOT EXISTS default.modelEngagements (type String, modelId Int64, time DateTime default now()) ENGINE = MergeTree()ORDER BY modelId;",
    "CREATE TABLE IF NOT EXISTS default.articleEngagements ( type String, articleId Int64) ENGINE = MergeTree()ORDER BY articleId;",
    "CREATE TABLE IF NOT EXISTS default.tagEngagements ( type String, tagId Int64) ENGINE = MergeTree()ORDER BY tagId;",
    "CREATE TABLE IF NOT EXISTS default.userEngagements ( type String, targetUserId Int64) ENGINE = MergeTree()ORDER BY targetUserId;",
    "CREATE TABLE IF NOT EXISTS default.reports ( type String, entityType String, entityId Int64, reason String, status String) ENGINE = MergeTree()ORDER BY entityId;",
    "CREATE TABLE IF NOT EXISTS default.uniqueViews (entityId UInt32,type String,time DateTime default now()) ENGINE = MergeTree()ORDER BY entityId;",
    "CREATE TABLE IF NOT EXISTS default.modelVersionUniqueDownloads (modelVersionId Int64,time DateTime default now()) ENGINE = MergeTree()ORDER BY modelVersionId;"
];

const dropComments = [
  // Your DROP TABLE statements here
    "DROP TABLE default.views",
    "DROP TABLE default.modelEvents",
    "DROP TABLE default.modelVersionEvents",
    "DROP TABLE default.partnerEvents",
    "DROP TABLE default.userActivities",
    "DROP TABLE default.resourceReviews",
    "DROP TABLE default.reactions",
    "DROP TABLE default.questions",
    "DROP TABLE default.answers",
    "DROP TABLE default.comments",
    "DROP TABLE default.posts",
    "DROP TABLE default.images",
    "DROP TABLE default.modelEngagements",
    "DROP TABLE default.articleEngagements",
    "DROP TABLE default.tagEngagements",
    "DROP TABLE default.userEngagements",
    "DROP TABLE default.reports",
    "DROP TABLE default.uniqueViews",
    "DROP TABLE default.modelVersionUniqueDownloads"
];

(async () => {
  try {
    for (const comment of comments) {
      await client.command({
        query: comment
      });
      console.log("Successfully executed:", comment);
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close()
  }
})();
