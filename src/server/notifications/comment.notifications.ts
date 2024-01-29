import { createNotificationProcessor } from '~/server/notifications/base.notifications';

export const commentNotifications = createNotificationProcessor({
  'new-comment': {
    displayName: 'New comments on your models',
    prepareMessage: ({ details }) => ({
      message: `${details.username} commented on your ${details.modelName} model`,
      url: `/models/${details.modelId}?modal=commentThread&commentId=${details.commentId}`,
    }),
    prepareQuery: ({ lastSent }) => `
      WITH new_comments AS (
        SELECT DISTINCT
          m."userId" "ownerId",
          JSONB_BUILD_OBJECT(
            'modelId', c."modelId",
            'commentId', c.id,
            'modelName', m.name,
            'username', u.username
          ) "details"
        FROM "Comment" c
        JOIN "User" u ON c."userId" = u.id
        JOIN "Model" m ON m.id = c."modelId"
        WHERE m."userId" > 0
          AND c."parentId" IS NULL
          AND c."reviewId" IS NULL
          AND c."createdAt" > '${lastSent}'
          AND c."userId" != m."userId"
      )
      INSERT
      INTO "Notification"("id", "userId", "type", "details")
      SELECT
        REPLACE(gen_random_uuid()::text, '-', ''),
        "ownerId"    "userId",
        'new-comment' "type",
        details
      FROM new_comments r
      WHERE
        NOT EXISTS (SELECT 1 FROM "UserNotificationSettings" WHERE "userId" = "ownerId" AND type = 'new-comment')
        AND NOT EXISTS (
          SELECT 1
          FROM "Notification" n
          WHERE n."userId" = r."ownerId"
              AND n.type IN ('new-mention')
              AND n.details->>'commentId' = r.details->>'commentId'
        );
    `,
  },
  'new-comment-response': {
    displayName: 'New comment responses',
    prepareMessage: ({ details }) => ({
      message: `${details.username} responded to your comment on the ${details.modelName} model`,
      url: `/models/${details.modelId}?modal=commentThread&commentId=${
        details.parentId ?? details.commentId
      }&highlight=${details.commentId}`,
    }),
    prepareQuery: ({ lastSent }) => `
      WITH new_comment_response AS (
        SELECT DISTINCT
          p."userId" "ownerId",
          JSONB_BUILD_OBJECT(
            'modelId', c."modelId",
            'commentId', c.id,
            'parentId', p.id,
            'modelName', m.name,
            'username', u.username
          ) "details"
        FROM "Comment" c
        JOIN "Comment" p ON p.id = c."parentId"
        JOIN "User" u ON c."userId" = u.id
        JOIN "Model" m ON m.id = c."modelId"
        WHERE m."userId" > 0
          AND c."createdAt" > '${lastSent}'
          AND c."userId" != p."userId"
      )
      INSERT INTO "Notification"("id", "userId", "type", "details")
      SELECT
        REPLACE(gen_random_uuid()::text, '-', ''),
        "ownerId"    "userId",
        'new-comment-response' "type",
        details
      FROM new_comment_response r
      WHERE
        NOT EXISTS (SELECT 1 FROM "UserNotificationSettings" WHERE "userId" = "ownerId" AND type = 'new-comment-response')
        AND NOT EXISTS (
          SELECT 1
          FROM "Notification" n
          WHERE n."userId" = r."ownerId"
              AND n.type IN ('new-comment-nested', 'new-thread-response', 'new-mention')
              AND n.details->>'commentId' = r.details->>'commentId'
        );
    `,
  },
  'new-comment-nested': {
    displayName: 'New responses to comments and reviews on your models',
    prepareMessage: ({ details }) => ({
      message: `${details.username} responded to a ${details.parentType} on your ${details.modelName} model`,
      url: `/models/${details.modelId}?modal=${details.parentType}Thread&${details.parentType}Id=${details.parentId}&highlight=${details.commentId}`,
    }),
    prepareQuery: ({ lastSent }) => `
      WITH new_comments_nested AS (
        SELECT DISTINCT
          m."userId" "ownerId",
          JSONB_BUILD_OBJECT(
            'modelId', c."modelId",
            'commentId', c.id,
            'parentId', COALESCE(c."parentId", c."reviewId"),
            'parentType', CASE WHEN c."parentId" IS NOT NULL THEN 'comment' ELSE 'review' END,
            'modelName', m.name,
            'username', u.username
          ) "details"
        FROM "Comment" c
        JOIN "User" u ON c."userId" = u.id
        JOIN "Model" m ON m.id = c."modelId"
        WHERE m."userId" > 0
          AND (c."parentId" IS NOT NULL OR c."reviewId" IS NOT NULL)
          AND c."createdAt" > '${lastSent}'
          AND c."userId" != m."userId"
      )
      INSERT INTO "Notification"("id", "userId", "type", "details")
      SELECT
        REPLACE(gen_random_uuid()::text, '-', ''),
        "ownerId"    "userId",
        'new-comment-nested' "type",
        details
      FROM new_comments_nested r
      WHERE
        NOT EXISTS (SELECT 1 FROM "UserNotificationSettings" WHERE "userId" = "ownerId" AND type = 'new-comment-nested')
        AND NOT EXISTS (
          SELECT 1
          FROM "Notification" n
          WHERE n."userId" = r."ownerId"
              AND n.type IN ('new-thread-response', 'new-comment-response', 'new-mention', 'new-comment-nested')
              AND n.details->>'commentId' = r.details->>'commentId'
        );
    `,
  },
  'new-thread-response': {
    displayName: 'New replies to comment threads you are in',
    prepareMessage: ({ details }) => ({
      message: `${details.username} responded to the ${details.parentType} thread on the ${details.modelName} model`,
      url: `/models/${details.modelId}?modal=${details.parentType}Thread&${details.parentType}Id=${details.parentId}&highlight=${details.commentId}`,
    }),
    prepareQuery: ({ lastSent }) => `
      WITH users_in_thread AS (
        SELECT DISTINCT
          CASE WHEN "parentId" IS NOT NULL THEN 'comment' ELSE 'review' END "type",
          COALESCE("reviewId", "parentId") AS "parentId",
          "userId"
        FROM "Comment"
        WHERE "reviewId" IS NOT NULL OR "parentId" IS NOT NULL
      ), new_thread_response AS (
        SELECT DISTINCT
          uit."userId" "ownerId",
          JSONB_BUILD_OBJECT(
            'modelId', c."modelId",
            'commentId', c.id,
            'parentId', COALESCE(c."parentId", c."reviewId"),
            'parentType', CASE WHEN c."parentId" IS NOT NULL THEN 'comment' ELSE 'review' END,
            'modelName', m.name,
            'username', u.username
          ) "details"
        FROM "Comment" c
        JOIN "Model" m ON m.id = c."modelId"
        JOIN "User" u ON c."userId" = u.id
        JOIN users_in_thread uit
          ON (
            (uit.type = 'review' AND uit."parentId" = c."reviewId")
            OR (uit.type = 'comment' AND uit."parentId" = c."parentId")
          ) AND uit."userId" != c."userId"
        WHERE (c."parentId" IS NOT NULL OR c."reviewId" IS NOT NULL)
          AND c."createdAt" > '${lastSent}'
      )
      INSERT INTO "Notification"("id", "userId", "type", "details")
      SELECT
        REPLACE(gen_random_uuid()::text, '-', ''),
        "ownerId"    "userId",
        'new-thread-response' "type",
        details
      FROM new_thread_response r
      WHERE
        NOT EXISTS (SELECT 1 FROM "UserNotificationSettings" WHERE "userId" = "ownerId" AND type = 'new-thread-response')
        AND NOT EXISTS (
          SELECT 1
          FROM "Notification" n
          WHERE n."userId" = r."ownerId"
              AND n.type IN ('new-comment-nested', 'new-comment-response', 'new-mention')
              AND n.details->>'commentId' = r.details->>'commentId'
        );
    `,
  },
  'new-review-response': {
    displayName: 'New review responses',
    prepareMessage: ({ details }) => {
      if (details.version !== 2) {
        return {
          message: `${details.username} responded to your review on the ${details.modelName} model`,
          url: `/models/${details.modelId}?modal=reviewThread&reviewId=${details.reviewId}&highlight=${details.commentId}`,
        };
      }

      return {
        message: `${details.username} responded to your review on the ${details.modelName} model`,
        url: `/reviews/${details.reviewId}?highlight=${details.commentId}`,
      };
    },
    prepareQuery: ({ lastSent }) => `
    WITH new_review_response AS (
      SELECT DISTINCT
        r."userId" "ownerId",
        JSONB_BUILD_OBJECT(
          'version', 2,
          'modelId', r."modelId",
          'commentId', c.id,
          'reviewId', r.id,
          'modelName', m.name,
          'username', u.username
        ) "details"
      FROM "CommentV2" c
      JOIN "Thread" t ON t.id = c."threadId"
      JOIN "ResourceReview" r ON r.id = t."reviewId"
      JOIN "User" u ON c."userId" = u.id
      JOIN "Model" m ON m.id = r."modelId"
      WHERE m."userId" > 0
        AND c."createdAt" > '${lastSent}'
        AND c."userId" != r."userId"
      )
      INSERT INTO "Notification"("id", "userId", "type", "details")
      SELECT
      REPLACE(gen_random_uuid()::text, '-', ''),
      "ownerId"    "userId",
      'new-review-response' "type",
      details
      FROM new_review_response r
      WHERE
      NOT EXISTS (SELECT 1 FROM "UserNotificationSettings" WHERE "userId" = "ownerId" AND type = 'new-review-response')
      AND NOT EXISTS (
        SELECT 1
        FROM "Notification" n
        WHERE n."userId" = r."ownerId"
            AND n.type IN ('new-comment-nested', 'new-thread-response', 'new-mention')
            AND n.details->>'commentId' = r.details->>'commentId'
      );
    `,
  },
  'new-image-comment': {
    displayName: 'New comments on your images',
    prepareMessage: ({ details }) => {
      if (details.version === 2) {
        let message = `${details.username} commented on your image`;
        if (details.modelName) message += ` posted to the ${details.modelName} model`;

        const url = `/images/${details.imageId}?postId=${details.postId}&highlight=${details.commentId}`;
        return { message, url };
      }

      // Prep message
      const message = `${details.username} commented on your ${
        details.reviewId ? 'review image' : 'example image'
      } posted to the ${details.modelName} model`;

      // Prep URL
      const searchParams: Record<string, string> = {
        model: details.modelId,
        modelVersionId: details.modelVersionId,
        highlight: details.commentId,
        infinite: 'false',
      };
      if (details.reviewId) {
        searchParams.review = details.reviewId;
        searchParams.returnUrl = `/models/${details.modelId}?modal=reviewThread&reviewId=${details.reviewId}`;
      } else {
        searchParams.returnUrl = `/models/${details.modelId}`;
      }
      const url = `/images/${details.imageId}?${new URLSearchParams(searchParams).toString()}`;

      return { message, url };
    },
    prepareQuery: ({ lastSent }) => `
      WITH new_image_comment AS (
        SELECT DISTINCT
          i."userId" "ownerId",
          JSONB_BUILD_OBJECT(
            'version', 2,
            'imageId', t."imageId",
            'postId', i."postId",
            'commentId', c.id,
            'username', u.username,
            'modelName', m.name,
            'modelId', m.id,
            'modelVersionId', p."modelVersionId",
            'modelVersionName', mv.name
          ) "details"
        FROM "CommentV2" c
        JOIN "Thread" t ON t.id = c."threadId" AND t."imageId" IS NOT NULL
        JOIN "Image" i ON i.id = t."imageId"
        JOIN "Post" p ON p.id = i."postId"
        LEFT JOIN "ModelVersion" mv ON mv.id = p."modelVersionId"
        LEFT JOIN "Model" m ON m.id = mv."modelId"
        JOIN "User" u ON c."userId" = u.id
        WHERE m."userId" > 0
          AND c."createdAt" > '${lastSent}'
          AND c."userId" != i."userId"
      )
      INSERT INTO "Notification"("id", "userId", "type", "details")
      SELECT
        REPLACE(gen_random_uuid()::text, '-', ''),
        "ownerId"    "userId",
        'new-image-comment' "type",
        details
      FROM new_image_comment
      WHERE
        NOT EXISTS (SELECT 1 FROM "UserNotificationSettings" WHERE "userId" = "ownerId" AND type = 'new-image-comment');
    `,
  },
  'new-article-comment': {
    displayName: 'New comments on your articles',
    prepareMessage: ({ details }) => ({
      message: `${details.username} commented on your article: "${details.articleTitle}"`,
      url: `/articles/${details.articleId}?highlight=${details.commentId}#comments`,
    }),
    prepareQuery: ({ lastSent }) => `
      WITH new_article_comment AS (
        SELECT DISTINCT
          a."userId" "ownerId",
          JSONB_BUILD_OBJECT(
            'articleId', a.id,
            'articleTitle', a.title,
            'commentId', c.id,
            'username', u.username
          ) "details"
        FROM "CommentV2" c
        JOIN "User" u ON c."userId" = u.id
        JOIN "Thread" t ON t.id = c."threadId" AND t."articleId" IS NOT NULL
        JOIN "Article" a ON a.id = t."articleId"
        WHERE a."userId" > 0
          AND c."createdAt" > '${lastSent}'
          AND c."userId" != a."userId"
      )
      INSERT INTO "Notification"("id", "userId", "type", "details")
      SELECT
        REPLACE(gen_random_uuid()::text, '-', ''),
        "ownerId"    "userId",
        'new-article-comment' "type",
        details
      FROM new_article_comment
      WHERE
        NOT EXISTS (SELECT 1 FROM "UserNotificationSettings" WHERE "userId" = "ownerId" AND type = 'new-article-comment');
    `,
  },
});
