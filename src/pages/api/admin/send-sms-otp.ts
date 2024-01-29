import Dysmsapi20170525, * as $Dysmsapi20170525 from '@alicloud/dysmsapi20170525';
import * as $OpenApi from '@alicloud/openapi-client';
import * as $Util from '@alicloud/tea-util';
import { env } from '~/env/server.mjs';
import { NextApiRequest, NextApiResponse } from 'next';
import CryptoJS from 'crypto-js';

// import { getSession } from 'next-auth/react';

function createClient(accessKeyId: string, accessKeySecret: string): Dysmsapi20170525 {
  const config = new $OpenApi.Config({
    // 必填，您的 AccessKey ID
    accessKeyId: accessKeyId,
    // 必填，您的 AccessKey Secret
    accessKeySecret: accessKeySecret,
  });
  // 访问的域名
  config.endpoint = `dysmsapi.aliyuncs.com`;
  return new Dysmsapi20170525(config);
}

export async function aliyunSendSMS(identifier: string, token: string) {
  const client = createClient(
    env['ALIBABA_CLOUD_ACCESS_KEY_ID'],
    env['ALIBABA_CLOUD_ACCESS_KEY_SECRET']
  );
  const sendSmsRequest = new $Dysmsapi20170525.SendSmsRequest({
    signName: '阿里云短信测试',
    templateCode: 'SMS_154950909',
    phoneNumbers: identifier.split('@')[0],
    templateParam: `{"code":'${token}'}`,
  });
  const runtime = new $Util.RuntimeOptions({});
  try {
    await client.sendSmsWithOptions(sendSmsRequest, runtime);
  } catch (error) {
    console.log(error);
  }
}

//生成随机字符串
const createNonceStr = function () {
  return Math.random().toString(36).substring(2, 15);
};
// 生成时间戳 秒值
const createTimestamp = function () {
  return parseInt((new Date().getTime() / 1000).toString());
};
//进行SHA1哈希计算，转化成16进制字符
const generateSHA1SignatureByHex = (appSecret: string, nonce: string, timestamp: string) => {
  const sha1Str = appSecret + nonce + timestamp;
  const hash = CryptoJS.SHA1(sha1Str);
  const SHA1 = CryptoJS.enc.Hex.stringify(hash);
  return SHA1;
};

const getRequestSmsHeaders = function () {
  const appKey = env['YUNXIN_APP_KEY'];
  const appSecret = env['YUNXIN_APP_SECRET'];
  const Nonce = createNonceStr();
  const CurTime = createTimestamp().toString();
  const SHA1 = generateSHA1SignatureByHex(appSecret, Nonce, CurTime);
  return {
    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    AppKey: appKey,
    Nonce: Nonce,
    CurTime: CurTime,
    CheckSum: SHA1,
  };
};

export function yunxinSendSMS(identifier: string, token: string) {
  fetch('https://api.netease.im/sms/sendcode.action', {
    method: 'POST',
    headers: getRequestSmsHeaders(),
    body: new URLSearchParams({
      templateid: '22512927',
      mobile: identifier.split('@')[0],
      authCode: token,
    }),
  })
    .then((res) => res.json())
    .then((data) => console.log(data));
}

const sendSmsbyAPI = async (req: NextApiRequest, res: NextApiResponse) => {
  // const session = await getSession({ req });
  // if (!session) {
  //   return res.status(401).json({ message: 'Not Authorized' });
  // }
  const data = JSON.parse(req.body);
  await yunxinSendSMS(data.identifier, data.token);
  return res.status(200).json({ success: true });
};

export default sendSmsbyAPI;
