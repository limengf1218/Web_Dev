import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { User } from '@prisma/client';
import NextAuth, { Session, type NextAuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import RedditProvider from 'next-auth/providers/reddit';
import EmailProvider from 'next-auth/providers/email';
import { env } from '~/env/server.mjs';
import { dbWrite } from '~/server/db/client';
import { getRandomInt } from '~/utils/number-helpers';
import { sendVerificationRequest } from '~/server/auth/verificationEmail';
import { refreshToken, invalidateSession } from '~/server/utils/session-helpers';
import { getSessionUser, updateAccountScope } from '~/server/services/user.service';
import { Tracker } from '~/server/clickhouse/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { mikomikoTokenCookieName, useSecureCookies } from '~/libs/auth';
import { yunxinSendSMS } from '../admin/send-sms-otp';

export interface SnsUserInfoResponse {
  openid: string;
  nickname: string;
  sex: number; // 1 male 2 female 0 unknown
  province: string;
  city: string;
  country: string;
  headimgurl: string;
  privilege: string[];
  unionid: string;
}

export interface SnsOAuth2AccessTokenResponse {
  openid: string;
  unionid: string;
  scope: string;
  access_token: string;
  refresh_token: string; // 30d
  expires_in: number; // 7200
}

const setUserName = async (id: number, setTo: string) => {
  try {
    setTo = setTo.split('@')[0].replace(/[^A-Za-z0-9_]/g, '');
    const { username } = await dbWrite.user.update({
      where: { id },
      data: {
        username: `${setTo}${getRandomInt(100, 999)}`,
      },
      select: {
        username: true,
      },
    });
    return username ? username : undefined;
  } catch (e) {
    return undefined;
  }
};

const { hostname } = new URL(env.NEXTAUTH_URL);

export function createAuthOptions(): NextAuthOptions {
  return {
    adapter: PrismaAdapter(dbWrite),
    session: {
      strategy: 'jwt',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    events: {
      createUser: async ({ user }) => {
        const startingUsername = user.email?.trim() ?? user.name?.trim() ?? `civ_`;
        if (startingUsername) {
          let username: string | undefined = undefined;
          while (!username) username = await setUserName(Number(user.id), startingUsername);
        }
      },
    },
    callbacks: {
      async signIn({ account }) {
        if (account?.provider === 'discord' && !!account.scope) await updateAccountScope(account);

        return true;
      },
      async jwt({ token, user, trigger }) {
        if (trigger === 'update') {
          await invalidateSession(Number(token.sub));
          const user = await getSessionUser({ userId: Number(token.sub) });
          token.user = user;
        } else {
          token.sub = Number(token.sub) as any; //eslint-disable-line
          if (user) token.user = user;
          const { deletedAt, ...restUser } = token.user as User;
          token.user = { ...restUser };
        }

        return token;
      },
      async session({ session, token }) {
        token = await refreshToken(token);
        session.user = (token.user ? token.user : session.user) as Session['user'];
        return session;
      },
    },
    // Configure one or more authentication providers
    providers: [
      {
        id: 'wechat',
        name: 'WeChat',
        type: 'oauth',
        authorization: `https://open.weixin.qq.com/connect/qrconnect?appid=${env.WECHAT_OPEN_APP_ID}&response_type=code&scope=snsapi_login`,
        token: {
          // https://api.weixin.qq.com/sns/oauth2/access_token?appid=APPID&secret=SECRET&code=CODE&grant_type=authorization_code
          url: 'https://api.weixin.qq.com/sns/oauth2/access_token',
          params: {
            appid: env.WECHAT_OPEN_APP_ID,
            secret: env.WECHAT_OPEN_APP_SECRET,
            grant_type: 'authorization_code',
          },
          async request({ provider, params }) {
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
            const url = new URL((provider.token as any).url);
            url.search = new URLSearchParams(params as Record<string, string>).toString();
            const r = (await fetch(url).then((v) => v.json())) as SnsOAuth2AccessTokenResponse;
            return {
              tokens: {
                access_token: r.access_token,
                scope: r.scope,
                refresh_token: r.refresh_token,
                expires_in: r.expires_in,
              },
            };
          },
        },
        userinfo: {
          url: 'https://api.weixin.qq.com/sns/userinfo',
          async request({ provider, tokens }) {
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
            const url = new URL((provider.userinfo as any).url);
            url.search = new URLSearchParams({
              // eslint-disable-next-line  @typescript-eslint/no-explicit-any
              ...(provider.userinfo as any).params,
              access_token: tokens.access_token,
              openid: tokens.openid,
            } as Record<string, string>).toString();

            const r = (await fetch(url).then((v) => v.json())) as SnsUserInfoResponse;
            return {
              id: r.openid,
              name: r.nickname,
              image: r.headimgurl,
            };
          },
        },
        clientId: env.WECHAT_OPEN_APP_ID,
        clientSecret: env.WECHAT_OPEN_APP_SECRET,
        profile(profile) {
          return {
            ...profile,
            id: profile.id,
            name: profile.name,
            image: profile.image,
          };
        },
      },
      {
        id: 'otp',
        name: 'otp',
        type: 'email',
        server: {},
        maxAge: 10 * 60 * 60,
        generateVerificationToken: async () => {
          const digits = '1234567890';
          let otp = '';
          for (let i = 0; i < 6; i++) {
            otp += digits[Math.floor(Math.random() * 10)];
          }
          return otp;
        },
        async sendVerificationRequest(params) {
          yunxinSendSMS(params.identifier, params.token);
        },
        options: {},
      },
      DiscordProvider({
        clientId: env.DISCORD_CLIENT_ID,
        clientSecret: env.DISCORD_CLIENT_SECRET,
        authorization: {
          params: { scope: 'identify email role_connections.write' },
        },
      }),
      GithubProvider({
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: true,
      }),
      GoogleProvider({
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: true,
      }),
      RedditProvider({
        clientId: env.REDDIT_CLIENT_ID,
        clientSecret: env.REDDIT_CLIENT_SECRET,
        authorization: {
          params: {
            duration: 'permanent',
          },
        },
      }),
      EmailProvider({
        server: {
          host: env.EMAIL_HOST,
          port: env.EMAIL_PORT,
          auth: {
            user: env.EMAIL_USER,
            pass: env.EMAIL_PASS,
          },
        },
        sendVerificationRequest,
        from: env.EMAIL_FROM,
      }),
    ],
    cookies: {
      sessionToken: {
        name: mikomikoTokenCookieName,
        options: {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure: useSecureCookies,
          domain: hostname == 'localhost' ? hostname : '.' + hostname, // add a . in front so that subdomains are included
        },
      },
    },
    pages: {
      signIn: '/login',
      error: '/login',
    },
  };
}

export const authOptions = createAuthOptions();

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  const customAuthOptions = createAuthOptions();
  customAuthOptions.events ??= {};
  customAuthOptions.events.signIn = async (context) => {
    if (context.isNewUser) {
      const tracker = new Tracker(req, res);
      await tracker.userActivity({
        type: 'Registration',
        targetUserId: parseInt(context.user.id),
      });
    }
  };
  return await NextAuth(req, res, customAuthOptions);
}
