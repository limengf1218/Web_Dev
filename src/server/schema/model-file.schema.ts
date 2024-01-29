import { z } from 'zod';
import { constants } from '~/server/common/constants';
import { ModelHashType } from '@prisma/client';

export const modelFileMetadataSchema = z.object({
  format: z.enum(constants.modelFileFormats).nullish(),
  size: z.enum(constants.modelFileSizes).nullish(),
  fp: z.enum(constants.modelFileFp).nullish(),
});

export const modelFileSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  url: z.string().url().min(1, 'You must select a file'),
  sizeKB: z.number(),
  type: z.enum(constants.modelFileTypes),
  metadata: modelFileMetadataSchema.optional(),
});

export type ModelFileInput = z.infer<typeof modelFileSchema>;

export type ModelFileCreateInput = z.infer<typeof modelFileCreateSchema>;
export const modelFileCreateSchema = z.object({
  name: z.string(),
  url: z.string().url().min(1, 'You must select a file'),
  sizeKB: z.number(),
  type: z.enum(constants.modelFileTypes),
  modelVersionId: z.number(),
  metadata: modelFileMetadataSchema.optional(),
});

export type ModelFileUpdateInput = z.infer<typeof modelFileUpdateSchema>;
export const modelFileUpdateSchema = z.object({
  id: z.number().optional(),
  type: z.enum(constants.modelFileTypes).optional(),
  modelVersionId: z.number().optional(),
  metadata: modelFileMetadataSchema.optional(),
});

// export const modelFileUpdateSchema = z.object({
//   id: z.number(),
//   type: z.enum(constants.modelFileTypes).optional(),
//   modelVersionId: z.number().optional(), // used when a user needs to reassign a file to another version
// });

export type ModelFileHashUpsertInput = z.infer<typeof modelFileHashUpdateSchema>;
export const modelFileHashUpdateSchema = z.object({
  fileId: z.number(),
  type: z.nativeEnum(ModelHashType),
  hash: z.string(),
  createdAt: z.string().optional(),
});
