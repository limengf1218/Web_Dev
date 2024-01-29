import {
  createFileHandler,
  deleteFileHandler,
  getFilesByVersionIdHandler,
  updateFileHandler,
  createSeedFileHandler,
  deleteSeedFileHandler,
  upsertSeedModelFileHashHandler,
} from '~/server/controllers/model-file.controller';
import { getByIdSchema } from '~/server/schema/base.schema';
import {
  modelFileCreateSchema,
  modelFileUpdateSchema,
  modelFileHashUpdateSchema,
} from '~/server/schema/model-file.schema';
import { middleware, protectedProcedure, publicProcedure, router } from '~/server/trpc';
import { throwAuthorizationError } from '~/server/utils/errorHandling';
import { z } from 'zod';
import { ScanResultCode } from '@prisma/client';

const isModerator = middleware(async ({ ctx, next }) => {
  if (!ctx.user) throw throwAuthorizationError();

  const isModerator = ctx?.user?.isModerator;
  if (!isModerator) {
    throw throwAuthorizationError();
  }

  return next({
    ctx: {
      // infers the `user` as non-nullable
      user: ctx.user,
    },
  });
});

export const modelFileRouter = router({
  getByVersionId: publicProcedure.input(getByIdSchema).query(getFilesByVersionIdHandler),
  create: protectedProcedure.input(modelFileCreateSchema).mutation(createFileHandler),
  update: protectedProcedure.input(modelFileUpdateSchema).mutation(updateFileHandler),
  delete: protectedProcedure.input(getByIdSchema).mutation(deleteFileHandler),
  // deleteMany: protectedProcedure.input(deleteApiKeyInputSchema).mutation(deleteApiKeyHandler),
  createSeed: protectedProcedure
    .input(
      modelFileCreateSchema.extend({
        id: z.number(),
        pickleScanResult: z.nativeEnum(ScanResultCode),
        pickleScanMessage: z.string(),
        virusScanResult: z.nativeEnum(ScanResultCode),
        virusScanMessage: z.string(),
        scannedAt: z.string(),
      })
    )
    .use(isModerator)
    .mutation(createSeedFileHandler),
  deleteSeed: protectedProcedure.input(getByIdSchema).mutation(deleteSeedFileHandler),
  addSeedModelFileHash: protectedProcedure
    .input(modelFileHashUpdateSchema)
    .use(isModerator)
    .mutation(upsertSeedModelFileHashHandler),
});
