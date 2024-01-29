import { GetResourceReviewPagedInput } from './../schema/resourceReview.schema';
import { GetByIdInput } from '~/server/schema/base.schema';
import {
  CreateResourceReviewInput,
  UpdateResourceReviewInput,
  UpsertResourceReviewInput,
} from '../schema/resourceReview.schema';
import { throwDbError } from '~/server/utils/errorHandling';
import {
  deleteResourceReview,
  upsertResourceReview,
  updateResourceReview,
  createResourceReview,
  getPagedResourceReviews,
  upsertSeedResourceReview,
} from '~/server/services/resourceReview.service';
import { Context } from '~/server/createContext';

export const upsertResourceReviewHandler = async ({
  input,
  ctx,
}: {
  input: UpsertResourceReviewInput;
  ctx: DeepNonNullable<Context>;
}) => {
  try {
    return await upsertResourceReview({ ...input, userId: ctx.user.id });
  } catch (error) {
    throw throwDbError(error);
  }
};

export const upsertSeedResourceReviewHandler = async ({
  input,
  ctx,
}: {
  input: UpsertResourceReviewInput & { userId: number };
  ctx: DeepNonNullable<Context>;
}) => {
  try {
    return await upsertSeedResourceReview(input);
  } catch (error) {
    console.log(error);
    throw throwDbError(error);
  }
};

export const createResourceReviewHandler = async ({
  input,
  ctx,
}: {
  input: CreateResourceReviewInput;
  ctx: DeepNonNullable<Context>;
}) => {
  try {
    const result = await createResourceReview({ ...input, userId: ctx.user.id });
    await ctx.track.resourceReview({
      type: 'Create',
      modelId: result.modelId,
      modelVersionId: result.modelVersion.id,
      rating: result.rating,
      nsfw: result.nsfw,
    });
    return result;
  } catch (error) {
    throw throwDbError(error);
  }
};

export const updateResourceReviewHandler = async ({
  input,
  ctx,
}: {
  input: UpdateResourceReviewInput;
  ctx: DeepNonNullable<Context>;
}) => {
  try {
    return await updateResourceReview({ ...input });
  } catch (error) {
    throw throwDbError(error);
  }
};

export const deleteResourceReviewHandler = async ({
  input,
  ctx,
}: {
  input: GetByIdInput;
  ctx: DeepNonNullable<Context>;
}) => {
  try {
    const result = await deleteResourceReview(input);
    await ctx.track.resourceReview({
      type: 'Delete',
      modelId: result.modelId,
      modelVersionId: result.modelVersionId,
      rating: result.rating,
      nsfw: result.nsfw,
    });
    return result;
  } catch (error) {
    throw throwDbError(error);
  }
};
