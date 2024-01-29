import { Prisma } from '@prisma/client';
import { simpleUserSelect } from '~/server/selectors/user.selector';

export const getReactionsSelect = Prisma.validator<Prisma.ReviewReactionSelect>()({
  id: true,
  reaction: true,
  user: {
    select: simpleUserSelect,
  },
});

export const getReactionsSelectV2 = Prisma.validator<Prisma.ReviewReactionSelect>()({
  userId: true,
  reaction: true,
});

export type ReactionDetails = Prisma.ReviewReactionGetPayload<typeof getReactions>;
const getReactions = Prisma.validator<Prisma.ReviewReactionArgs>()({
  select: getReactionsSelect,
});
