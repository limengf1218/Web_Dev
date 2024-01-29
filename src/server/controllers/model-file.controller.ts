import { TRPCError } from '@trpc/server';
import { GetByIdInput } from '~/server/schema/base.schema';
import {
  ModelFileCreateInput,
  ModelFileUpdateInput,
  ModelFileHashUpsertInput,
} from '~/server/schema/model-file.schema';
import {
  createFile,
  deleteFile,
  getByVersionId,
  updateFile,
  createSeedFile,
  upsertSeedModelFileHash,
} from '~/server/services/model-file.service';
import { throwDbError, throwNotFoundError } from '~/server/utils/errorHandling';
import { Context } from '~/server/createContext';

export const getFilesByVersionIdHandler = async ({ input }: { input: GetByIdInput }) => {
  try {
    return await getByVersionId({ modelVersionId: input.id });
  } catch (error) {
    throw throwDbError(error);
  }
};

export const createFileHandler = async ({ input }: { input: ModelFileCreateInput }) => {
  try {
    const file = await createFile({
      ...input,
      select: {
        id: true,
        name: true,
        modelVersion: {
          select: {
            id: true,
            status: true,
            _count: { select: { posts: { where: { publishedAt: { not: null } } } } },
          },
        },
      },
    });

    return file;
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    else throw throwDbError(error);
  }
};

export const createSeedFileHandler = async ({
  input,
}: {
  input: ModelFileCreateInput & { id: number };
}) => {
  try {
    const file = await createSeedFile({
      ...input,
      select: {
        id: true,
        name: true,
        modelVersion: {
          select: {
            id: true,
            status: true,
            _count: { select: { posts: { where: { publishedAt: { not: null } } } } },
          },
        },
      },
    });

    return file;
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    else throw throwDbError(error);
  }
};

export const updateFileHandler = async ({ input }: { input: ModelFileUpdateInput }) => {
  try {
    return await updateFile(input);
  } catch (error) {
    throw throwDbError(error);
  }
};

export const deleteFileHandler = async ({ input }: { input: GetByIdInput }) => {
  try {
    const deleted = await deleteFile(input);
    if (!deleted) throw throwNotFoundError(`No file with id ${input.id}`);

    return deleted;
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    else throw throwDbError(error);
  }
};

export const deleteSeedFileHandler = async ({ input }: { input: GetByIdInput }) => {
  try {
    return await deleteFile(input);
  } catch (error) {
    if (error instanceof TRPCError) throw error;
  }
};

export const upsertSeedModelFileHashHandler = async ({
  input,
  ctx,
}: {
  input: ModelFileHashUpsertInput;
  ctx: DeepNonNullable<Context>;
}) => {
  try {
    await upsertSeedModelFileHash(input);
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    else throw throwDbError(error);
  }
};
