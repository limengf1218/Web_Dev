import * as Schema from '../schema/wechat.schema';
import { invalidateSession } from '~/server/utils/session-helpers';
import { dbWrite, dbRead } from '~/server/db/client';
import WxPay from 'wechatpay-node-v3';
import { readFileSync } from 'fs';
import { env } from '~/env/server.mjs';
import path from 'path';
import { t } from 'i18next';
import { getBaseUrl } from '~/server/utils/url-helpers';

const generateUUID = () => {
  let d = new Date().getTime(); //Timestamp
  let d2 = (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0; //Time in microseconds since page-load or 0 if unsupported
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16; //random number between 0 and 16
    if (d > 0) {
      //Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      //Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid.replaceAll('-', '');
};

function generateTradeID() {
  return Math.floor(Math.random() * 2147483647) + 1;
}

export const createCustomer = async ({ id }: Schema.CreateCustomerInput) => {
  const user = await dbWrite.user.findUnique({
    where: { id },
    select: { customerId: true, username: true },
  });
  if (!user?.customerId) {
    const customer = { id: generateUUID() };
    await dbWrite.user.update({ where: { id }, data: { customerId: customer.id } });
    await invalidateSession(id);
    return customer.id;
  } else {
    return user.customerId;
  }
};

export const createDonateSession = async ({
  customerId,
  user,
}: {
  customerId?: string;
  user: Schema.CreateCustomerInput;
}) => {
  if (!customerId) {
    customerId = await createCustomer(user);
  }
  const certDirectory = path.resolve(process.cwd(), 'wechat');
  const pay = new WxPay({
    appid: env.WECHAT_PAY_APPID,
    mchid: env.WECHAT_PAY_MCHID,
    key: env.WECHAT_PAY_V3_SECRET,
    publicKey: readFileSync(path.join(certDirectory, 'apiclient_cert.pem')),
    privateKey: readFileSync(path.join(certDirectory, 'apiclient_key.pem')),
  });

  const tradeID = generateTradeID();

  const result = await pay.transactions_native({
    description: `${t('One-time Donation')} : ${user.username}`,
    out_trade_no: tradeID.toString(),
    notify_url: `${getBaseUrl()}/api/wechatpay/notify`,
    amount: {
      total: 1,
    },
    attach: customerId,
  });

  return { message: result.status !== 200 ? result.message : tradeID, url: result.code_url };
};

export const manageCheckoutPaymentDonate = async (sessionId: string, customerId: string) => {
  console.log('Wechat ID:', sessionId);
  const prevPurchase = await dbRead.purchase.findMany({
    where: { id: parseInt(sessionId) },
    select: { id: true },
  });
  if (prevPurchase.length === 0) {
    await dbWrite.purchase.create({
      data: {
        id: parseInt(sessionId),
        customerId,
        priceId: 'Donate',
        productId: 'Donate',
        status: 'SUCCESS',
      },
    });
  }
};
