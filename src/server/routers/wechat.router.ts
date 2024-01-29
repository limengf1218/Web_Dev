import {
  createCustomerHandler,
  createDonateSessionHandler,
} from './../controllers/wechat.controller';
import { router, protectedProcedure } from '~/server/trpc';
import * as Schema from '../schema/wechat.schema';

export const wechatRouter = router({
  createCustomer: protectedProcedure
    .input(Schema.createCustomerSchema)
    .mutation(createCustomerHandler),
  createDonateSession: protectedProcedure.mutation(createDonateSessionHandler),
});
