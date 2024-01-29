import { throwBadRequestError } from '~/server/utils/errorHandling';
import { ToggleReactionInput, ReactionEntityType } from './../schema/reaction.schema';
import { dbWrite, dbRead } from '~/server/db/client';
import { queueMetricUpdate } from '~/server/jobs/update-metrics';
import { playfab } from '~/server/playfab/client';

export const toggleReaction = async ({
  entityType,
  entityId,
  userId,
  reaction,
}: ToggleReactionInput & { userId: number }) => {
  const existing = await getReaction({ entityType, entityId, userId, reaction });
  if (existing) {
    await deleteReaction({ entityType, id: existing.id, entityId });
    return 'removed';
  } else {
    await createReaction({ entityType, entityId, userId, reaction });
    await playfab.trackEvent(userId, {
      eventName: `user_react_${entityType}`,
      id: entityId,
      reaction,
    });
    return 'created';
  }
};

const getReaction = async ({
  entityType,
  entityId,
  userId,
  reaction,
}: ToggleReactionInput & { userId: number }) => {
  switch (entityType) {
    case 'question':
      return await dbRead.questionReaction.findFirst({
        where: { userId, reaction, questionId: entityId },
        select: { id: true },
      });
    case 'answer':
      return await dbRead.answerReaction.findFirst({
        where: { userId, reaction, answerId: entityId },
        select: { id: true },
      });
    case 'commentOld':
      return await dbRead.commentReaction.findFirst({
        where: { userId, reaction, commentId: entityId },
        select: { id: true },
      });
    case 'comment':
      return await dbRead.commentV2Reaction.findFirst({
        where: { userId, reaction, commentId: entityId },
        select: { id: true },
      });
    case 'image':
      return await dbRead.imageReaction.findFirst({
        where: { userId, reaction, imageId: entityId },
        select: { id: true },
      });
    case 'post':
      return await dbRead.postReaction.findFirst({
        where: { userId, reaction, postId: entityId },
        select: { id: true },
      });
    case 'resourceReview':
      return await dbRead.resourceReviewReaction.findFirst({
        where: { userId, reaction, reviewId: entityId },
        select: { id: true },
      });
    case 'article':
      return await dbRead.articleReaction.findFirst({
        where: { userId, reaction, articleId: entityId },
        select: { id: true },
      });
    default:
      throw throwBadRequestError();
  }
};

const deleteReaction = async ({
  entityType,
  entityId,
  id,
}: {
  entityType: ReactionEntityType;
  entityId: number;
  id: number;
}) => {
  switch (entityType) {
    case 'question':
      await dbWrite.questionReaction.deleteMany({ where: { id } });
      await queueMetricUpdate('Question', entityId);
      return;
    case 'answer':
      await dbWrite.answerReaction.deleteMany({ where: { id } });
      await queueMetricUpdate('Answer', entityId);
      return;
    case 'commentOld':
      await dbWrite.commentReaction.deleteMany({ where: { id } });
      return;
    case 'comment':
      await dbWrite.commentV2Reaction.deleteMany({ where: { id } });
      return;
    case 'image':
      await dbWrite.imageReaction.deleteMany({ where: { id } });
      await queueMetricUpdate('Image', entityId);
      return;
    case 'post':
      await dbWrite.postReaction.deleteMany({ where: { id } });
      await queueMetricUpdate('Post', entityId);
      return;
    case 'resourceReview':
      await dbWrite.resourceReviewReaction.deleteMany({ where: { id } });
      return;
    case 'article':
      await dbWrite.articleReaction.deleteMany({ where: { id } });
      await queueMetricUpdate('Article', entityId);
      return;
    default:
      throw throwBadRequestError();
  }
};

const createReaction = async ({
  entityType,
  entityId,
  ...data
}: ToggleReactionInput & { userId: number }) => {
  switch (entityType) {
    case 'question':
      return await dbWrite.questionReaction.create({
        data: { ...data, questionId: entityId },
        select: { reaction: true },
      });
    case 'answer':
      return await dbWrite.answerReaction.create({
        data: { ...data, answerId: entityId },
        select: { reaction: true },
      });
    case 'commentOld':
      return await dbWrite.commentReaction.create({
        data: { ...data, commentId: entityId },
        select: { reaction: true },
      });
    case 'comment':
      return await dbWrite.commentV2Reaction.create({
        data: { ...data, commentId: entityId },
        select: { reaction: true },
      });
    case 'image':
      return await dbWrite.imageReaction.create({
        data: { ...data, imageId: entityId },
        select: { reaction: true },
      });
    case 'post':
      return await dbWrite.postReaction.create({
        data: { ...data, postId: entityId },
        select: { reaction: true },
      });
    case 'resourceReview':
      return await dbWrite.resourceReviewReaction.create({
        data: { ...data, reviewId: entityId },
        select: { reaction: true },
      });
    case 'article':
      return await dbWrite.articleReaction.create({
        data: { ...data, articleId: entityId },
        select: { reaction: true },
      });
    default:
      throw throwBadRequestError();
  }
};
