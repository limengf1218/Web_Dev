import type { DefaultSession } from 'next-auth';

interface ExtendedUser {
  id: number;
  showNsfw: boolean;
  blurNsfw: boolean;
  username: string;
  // cannyToken?: string;
  image?: string;
  email?: string;
  createdAt?: Date;
  tos?: boolean;
  isModerator?: boolean;
  customerId?: string;
  subscriptionId?: string;
  tier?: string;
  muted?: boolean;
  bannedAt?: Date;
  autoplayGifs?: boolean;
  onboarded?: boolean;
  permissions?: string[];
  filePreferences?: UserFilePreferences;
}

declare module 'next-auth' {
  interface DefaultUser extends ExtendedUser {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }

  interface SessionUser extends ExtendedUser, DefaultSession['user'] {}
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user?: ExtendedUser & DefaultSession['user'];
    error?: string;
  }
}
