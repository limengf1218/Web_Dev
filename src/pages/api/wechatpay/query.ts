import { NextApiRequest, NextApiResponse } from 'next';
import WxPay from 'wechatpay-node-v3';
import { env } from '~/env/server.mjs';
import { readFileSync } from 'fs';
import path from 'path';
import { manageCheckoutPaymentDonate } from '~/server/services/wechat.service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const certDirectory = path.resolve(process.cwd(), 'wechat');
      const pay = new WxPay({
        appid: env.WECHAT_PAY_APPID,
        mchid: env.WECHAT_PAY_MCHID,
        key: env.WECHAT_PAY_V3_SECRET,
        publicKey: readFileSync(path.join(certDirectory, 'apiclient_cert.pem')),
        privateKey: readFileSync(path.join(certDirectory, 'apiclient_key.pem')),
      });
      const tradeID = JSON.parse(req.body).tradeID;
      const result = await pay.query({ out_trade_no: tradeID });
      if (result.trade_state == 'SUCCESS') {
        await manageCheckoutPaymentDonate(result.out_trade_no, result.attach as string);
        return res.status(200).json({ trade_state: result.trade_state, customerId: result.attach });
      } else {
        return res.status(200).json({ trade_state: result.trade_state });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(`❌ Error message: ${error.message}`);
      return res.status(400).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }
}
