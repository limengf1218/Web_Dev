import { createNotificationProcessor } from '~/server/notifications/base.notifications';

export const reportNotifications = createNotificationProcessor({
  'report-actioned': {
    displayName: 'Report actioned',
    toggleable: false,
    prepareMessage: ({ details }) => ({
      message: `The ${details.reportType} you reported has been actioned. Thanks for helping keep the community safe!`,
    }),
    prepareQuery: async ({ lastSent }) => `
      WITH actioned AS (
        SELECT DISTINCT
          u."id" "ownerId",
          JSONB_BUILD_OBJECT(
            'reportId', r.id,
            'reportType',
              CASE
                WHEN EXISTS (SELECT 1 FROM "ResourceReviewReport" WHERE "reportId" = r.id) THEN 'review'
                WHEN EXISTS (SELECT 1 FROM "ReviewReport" WHERE "reportId" = r.id) THEN 'review'
                WHEN EXISTS (SELECT 1 FROM "ModelReport" WHERE "reportId" = r.id) THEN 'resource'
                WHEN EXISTS (SELECT 1 FROM "CommentReport" WHERE "reportId" = r.id) THEN 'comment'
                WHEN EXISTS (SELECT 1 FROM "CommentV2Report" WHERE "reportId" = r.id) THEN 'comment'
                WHEN EXISTS (SELECT 1 FROM "ImageReport" WHERE "reportId" = r.id) THEN 'image'
                WHEN EXISTS (SELECT 1 FROM "ArticleReport" WHERE "reportId" = r.id) THEN 'article'
              END,
            'reportReason', r.reason,
            'createdAt', r."createdAt"
          ) "details"
        FROM "Report" r
        JOIN "User" u ON u.id = r."userId" OR u.id = ANY(r."alsoReportedBy")
        WHERE
          r."userId" > 0 AND
          r.reason != 'NSFW' AND
          r."statusSetAt" > '${lastSent}' AND
          r.status = 'Actioned'
      )
      INSERT INTO "Notification"("id", "userId", "type", "details")
      SELECT
        REPLACE(gen_random_uuid()::text, '-', ''),
        "ownerId"    "userId",
        'report-actioned' "type",
        details
      FROM actioned r
      WHERE NOT EXISTS (
        SELECT 1
        FROM "Notification" n
        WHERE n."userId" = r."ownerId"
            AND n.type IN ('report-actioned')
            AND n.details->>'reportId' = r.details->>'reportId'
      );
    `,
  },
});
