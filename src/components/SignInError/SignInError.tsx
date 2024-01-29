import { useTranslation } from 'react-i18next';
import { Alert, AlertProps } from '@mantine/core';



type SignInErrorProps = { error: string } & Omit<AlertProps, 'children'>;

export const SignInError = ({ error, ...alertProps }: SignInErrorProps) => {
  const { t } = useTranslation();
  const errors: Record<string, string> = {
    Signin: 'Try signing with a different account.',
    OAuthSignin: 'Try signing with a different account.',
    OAuthCallback: 'Try signing with a different account.',
    OAuthCreateAccount: 'Try signing with a different account.',
    EmailCreateAccount: 'Try signing with a different account.',
    Callback: 'Try signing with a different account.',
    OAuthAccountNotLinked:
      'To confirm your identity, sign in with the same account you used originally.',
    EmailSignin: 'Check your email address.',
    CredentialsSignin: 'Sign in failed. Check the details you provided are correct.',
    default: 'Unable to sign in.',
  };
  const errorMessage = error && (errors[error] ?? errors.default);
  return <Alert {...alertProps}>{t(errorMessage)}</Alert>;
};

