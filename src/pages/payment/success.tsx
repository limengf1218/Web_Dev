import { useTranslation } from 'react-i18next';
import {
  Container,
  Stack,
  Title,
  Text,
  Alert,
  ThemeIcon,
  Group,
  Button,
  Center,
  Image,
} from '@mantine/core';
import { NextLink } from '@mantine/next';
import { IconCircleCheck, IconLayoutDashboard, IconRosette } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { enterFall, jelloVerical } from '~/libs/animations';
import { NotFound } from '~/components/AppLayout/NotFound';

export default function PaymentSuccess() {
  const { t } = useTranslation();
  const router = useRouter();
  const { cid } = router.query as { cid: string };
  const { customerId, refresh } = useCurrentUser() ?? {};

  // Only run once - otherwise we'll get an infinite loop
  useEffect(() => {
    refresh?.();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (cid !== customerId?.slice(-8)) {
    return <NotFound />;
  }

  return (
    <Container size="xs" mb="lg">
      <Stack>
        <Alert radius="sm" color="green" sx={{ zIndex: 10 }}>
          <Group spacing="xs" noWrap position="center">
            <ThemeIcon color="green" size="lg">
              <IconCircleCheck />
            </ThemeIcon>
            <Title order={2}>{t('Payment Complete!')}</Title>
          </Group>
        </Alert>
        <Center
          sx={{
            animation: `${jelloVerical} 2s 1s ease-in-out`,
            animationName: `${enterFall}, ${jelloVerical}`,
            animationDuration: `1.5s, 2s`,
            animationDelay: `0s, 1.5s`,
            animationIterationCount: '1, 1',
          }}
        >
          <Image width={250} src="/images/android-chrome-512x512.jpg" alt="mikomiko" />
        </Center>
        <Title order={1} align="center">
          {t('Thank you! 🎉')}
        </Title>
        <Text size="lg" align="center" mb="lg">
          {t(
            `Thank you so much for your support! Your perks may take a few moments* to come in to effect, but our love for you is instant.`
          )}
        </Text>

        <Group grow>
          <Button component={NextLink} href="/" size="md" leftIcon={<IconLayoutDashboard />}>
            {t('View Models')}
          </Button>
          <Button
            variant="light"
            component={NextLink}
            href="/user/account"
            size="md"
            rightIcon={<IconRosette />}
          >
            {t('Edit Profile')}
          </Button>
        </Group>
        <Text size="xs" color="dimmed">
          {t(
            `*Cosmetics and other perks should be delivered within 2-3 minutes, but you may need to refresh the site before you're able to see them in your profile.`
          )}
        </Text>
      </Stack>
    </Container>
  );
}
