import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Paper,
  Stack,
  Text,
  Alert,
  Group,
  ThemeIcon,
  Divider,
  Button,
} from '@mantine/core';
import { IconExclamationMark, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { GetServerSideProps } from 'next';
import { BuiltInProviderType } from 'next-auth/providers';
import { getCsrfToken, getProviders, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { EmailLogin } from '~/components/EmailLogin/EmailLogin';
import { SignInError } from '~/components/SignInError/SignInError';
import { SocialButton } from '~/components/Social/SocialButton';
import { getServerAuthSession } from '~/server/utils/get-server-auth-session';
import { createServerSideProps } from '~/server/utils/server-side-helpers';
import { loginRedirectReasons, LoginRedirectReason } from '~/utils/login-helpers';
import { OTPLogin } from '~/components/OTPLogin/OTPLogin';
import { SegmentedControl } from '@mantine/core';

export default function Login({ providers }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    error,
    returnUrl = '/',
    reason,
  } = router.query as { error: string; returnUrl: string; reason: LoginRedirectReason };

  const redirectReason = loginRedirectReasons[reason];

  const [expandProviders, setExpandProviders] = useState(false);
  const [selectedLogin, setSeletecLogin] = useState('Phone');

  const wechatProvider = providers?.wechat;

  const handleExpandProviders = () => {
    setExpandProviders(!expandProviders);
  };

  return (
    <Container size="xs">
      <Stack>
        {!!redirectReason && (
          <Alert color="yellow">
            <Group position="center" spacing="xs" noWrap align="flex-start">
              <ThemeIcon color="yellow">
                <IconExclamationMark />
              </ThemeIcon>
              <Text size="md">{t(redirectReason)}</Text>
            </Group>
          </Alert>
        )}
        <Paper radius="md" p="xl" withBorder>
          <Text size="lg" weight={500}>
            {t('Welcome to mikomiko, sign in with')}
          </Text>

          <Stack mb={error ? 'md' : undefined} mt="md">
            <Stack spacing="xs">
              {wechatProvider && (
                <SocialButton
                  key={wechatProvider.name}
                  provider={wechatProvider.id as BuiltInProviderType}
                  onClick={() => signIn(wechatProvider.id, { callbackUrl: returnUrl })}
                />
              )}
              <Button
                color="gray"
                onClick={handleExpandProviders}
                rightIcon={
                  expandProviders ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />
                }
              >
                {t('Other login methods')}
              </Button>
              {expandProviders &&
                providers &&
                Object.values(providers)
                  .filter((x) => x.id !== 'wechat' && x.id !== 'email' && x.id !== 'otp')
                  .map((provider) => (
                    <SocialButton
                      key={provider.name}
                      provider={provider.id as BuiltInProviderType}
                      onClick={() => signIn(provider.id, { callbackUrl: returnUrl })}
                    />
                  ))}
            </Stack>
            <Divider label={t('Or')} labelPosition="center" />
            <SegmentedControl
              radius="sm"
              size="sm"
              color="blue"
              data={[
                { label: '短信', value: 'Phone' },
                { label: '邮箱', value: 'Email' },
              ]}
              value={selectedLogin}
              onChange={setSeletecLogin}
            />
            {selectedLogin == 'Email' && <EmailLogin />}
            {selectedLogin == 'Phone' && <OTPLogin />}
          </Stack>
          {error && (
            <SignInError
              color="yellow"
              title={t('Login Error')}
              mt="lg"
              variant="outline"
              error={error}
            />
          )}
        </Paper>
      </Stack>
    </Container>
  );
}

type NextAuthProviders = AsyncReturnType<typeof getProviders>;
type NextAuthCsrfToken = AsyncReturnType<typeof getCsrfToken>;
type Props = {
  providers: NextAuthProviders;
  csrfToken: NextAuthCsrfToken;
};

export const getServerSideProps = createServerSideProps({
  useSession: true,
  resolver: async ({ session }) => {
    if (session) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    const providers = await getProviders();
    const csrfToken = await getCsrfToken();

    return {
      props: { providers, csrfToken },
    };
  },
});
