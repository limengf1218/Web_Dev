import * as Schema from '../schema/wechat.schema';
import { Context } from '~/server/createContext';
import { throwAuthorizationError } from '~/server/utils/errorHandling';

import { createCustomer, createDonateSession } from './../services/wechat.service';

export const createCustomerHandler = async ({ input }: { input: Schema.CreateCustomerInput }) => {
  return await createCustomer({ ...input });
};

export const createDonateSessionHandler = async ({ ctx }: { ctx: DeepNonNullable<Context> }) => {
  const { id, username, customerId } = ctx.user;
  if (!username) throw throwAuthorizationError('username required');
  const result = await createDonateSession({
    customerId,
    user: { id, username },
  });

  await ctx.track.userActivity({
    type: 'Donate',
    targetUserId: id,
  });

  return result;
};
