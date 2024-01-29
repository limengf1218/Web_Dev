export const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith('https://');
const cookiePrefix = useSecureCookies ? '__Secure-' : '';

export const mikomikoTokenCookieName = `${cookiePrefix}mikomiko-token`;
