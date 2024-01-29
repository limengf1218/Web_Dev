import { ReviewReactions } from '@prisma/client';
import { z } from 'zod';

export type ReactionEntityType = ToggleReactionInput['entityType'];
export type ToggleReactionInput = z.infer<typeof toggleReactionSchema>;
export const toggleReactionSchema = z.object({
  entityId: z.number(),
  entityType: z.enum([
    'question',
    'answer',
    'comment',
    'commentOld',
    'image',
    'post',
    'resourceReview',
    'article',
  ]),
  reaction: z.nativeEnum(ReviewReactions),
});
