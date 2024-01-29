import { articleNotifications } from '~/server/notifications/article.notifications';
import { BareNotification, NotificationProcessor } from '~/server/notifications/base.notifications';
import { commentNotifications } from '~/server/notifications/comment.notifications';
import { mentionNotifications } from '~/server/notifications/mention.notifications';
import { modelNotifications } from '~/server/notifications/model.notifications';
import { reactionNotifications } from '~/server/notifications/reaction.notifications';
import { reportNotifications } from '~/server/notifications/report.notifications';
import { reviewNotifications } from '~/server/notifications/review.notifications';
import { systemNotifications } from '~/server/notifications/system.notifications';
import { unpublishNotifications } from '~/server/notifications/unpublish.notifications';
import { userJourneyNotifications } from '~/server/notifications/user-journey.notifications';

const notificationProcessors = {
  ...mentionNotifications,
  ...modelNotifications,
  ...reviewNotifications,
  ...commentNotifications,
  ...reactionNotifications,
  ...systemNotifications,
  ...userJourneyNotifications,
  ...unpublishNotifications,
  ...articleNotifications,
  ...reportNotifications,
};

// Sort notifications by priority and group them by priority
const notifications = Object.entries(notificationProcessors)
  .map(([key, v]) => ({
    ...v,
    key,
  }))
  .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
const notificationBatches: (typeof notifications)[] = [[]];
let currentBatch = notificationBatches[0];
for (const notification of notifications) {
  const priority = notification.priority ?? 0;
  if (priority !== currentBatch[0]?.priority) {
    currentBatch = [];
    notificationBatches.push(currentBatch);
  }
  currentBatch.push(notification);
}
export { notificationBatches };

export function getNotificationMessage(notification: BareNotification) {
  const { prepareMessage } = notificationProcessors[notification.type] ?? {};
  if (!prepareMessage) return null;
  return prepareMessage(notification);
}

export function getNotificationTypes() {
  const notificationTypes: Record<string, string> = {};
  for (const [type, { displayName, toggleable }] of Object.entries(notificationProcessors)) {
    if (toggleable !== false) notificationTypes[type] = displayName;
  }
  return notificationTypes;
}

export function getNotificationTypesByGroup() {
  const notificationGroups: Record<string, Record<string, string>> = {
    mention: {},
    model: {},
    article: {},
    review: {},
    comment: {},
    reaction: {},
    userJourney: {},
    unpublish: {},
    report: {},
    system: {},
  };
  for (const [type, { displayName, toggleable }] of Object.entries(mentionNotifications)) {
    if (toggleable !== false) notificationGroups['mention'][type] = displayName;
  }
  for (const [type, { displayName, toggleable }] of Object.entries(modelNotifications)) {
    if (toggleable !== false) notificationGroups['model'][type] = displayName;
  }
  for (const [type, { displayName, toggleable }] of Object.entries(reviewNotifications)) {
    if (toggleable !== false) notificationGroups['review'][type] = displayName;
  }
  for (const [type, { displayName, toggleable }] of Object.entries(commentNotifications)) {
    if (toggleable !== false) notificationGroups['comment'][type] = displayName;
  }
  for (const [type, { displayName, toggleable }] of Object.entries(reactionNotifications)) {
    if (toggleable !== false) notificationGroups['reaction'][type] = displayName;
  }
  for (const [type, { displayName, toggleable }] of Object.entries(userJourneyNotifications)) {
    if (toggleable !== false) notificationGroups['userJourney'][type] = displayName;
  }
  for (const [type, { displayName, toggleable }] of Object.entries(unpublishNotifications)) {
    if (toggleable !== false) notificationGroups['unpublish'][type] = displayName;
  }
  for (const [type, { displayName, toggleable }] of Object.entries(articleNotifications)) {
    if (toggleable !== false) notificationGroups['article'][type] = displayName;
  }
  for (const [type, { displayName, toggleable }] of Object.entries(reportNotifications)) {
    if (toggleable !== false) notificationGroups['report'][type] = displayName;
  }
  for (const [type, { displayName, toggleable }] of Object.entries(systemNotifications)) {
    if (toggleable !== false) notificationGroups['system'][type] = displayName;
  }
  return notificationGroups;
}
