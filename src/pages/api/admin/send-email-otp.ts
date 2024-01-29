import { createTransport } from 'nodemailer';
import { env } from '~/env/server.mjs';
import { NextApiRequest, NextApiResponse } from 'next';

function html(token: string) {
  const brandColor = '#346df1';
  const buttonText = '#fff';

  const color = {
    background: '#f9f9f9',
    text: '#444',
    mainBackground: '#fff',
    buttonBackground: brandColor,
    buttonBorder: brandColor,
    buttonText,
  };

  return `
<body style="background: ${color.background};">
  <table width="100%" border="0" cellspacing="20" cellpadding="0"
    style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
    <tr>
      <td align="center"
        style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        Hello, <strong>${token}</strong> is your OTP for <strong>MikoMiko</strong>
      </td>
    </tr>
    <tr>
      <td align="center"
        style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
        If you did not request this email you can safely ignore it.
      </td>
    </tr>
  </table>
</body>
`;
}

/** Email Text body (fallback for email clients that don't render HTML, e.g. feature phones) */
function text(token: string) {
  return `${token} is your OTP for mikomiko`;
}

export async function sendEmailVerification(identifier: string, token: string) {
  const transport = createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
  });
  const result = await transport.sendMail({
    to: identifier,
    from: env.EMAIL_FROM,
    subject: `OTP for mikomiko`,
    text: text(token),
    html: html(token),
  });
  const failed = result.rejected.concat(result.pending).filter(Boolean);
  if (failed.length) {
    throw new Error(`Email (${failed.join(', ')}) could not be sent`);
  }
}

const sendEmailbyAPI = async (req: NextApiRequest, res: NextApiResponse) => {
  // const session = await getSession({ req });
  // if (!session) {
  //   return res.status(401).json({ message: 'Not Authorized' });
  // }
  const data = JSON.parse(req.body);
  await sendEmailVerification(data.identifier, data.token);
  return res.status(200).json({ success: true });
};

export default sendEmailbyAPI;
