import { useTranslation } from 'react-i18next';
import { Button, Container, Group, Paper, Stack, Text } from '@mantine/core';
import { NextLink } from '@mantine/next';
import { IconEyeOff, IconKey } from '@tabler/icons-react';
import { useRouter } from 'next/router';

export function SensitiveShield() {
const { t } = useTranslation();
  const router = useRouter();
  return (
    <Container size="xs">
      <Paper p="xl" radius="md" withBorder>
        <Stack align="center">
          <IconEyeOff size={56} />
          <Text size="xl" weight={500}>
            {t('Sensitive Content')}
          </Text>
          <Text>{t('This content has been marked as NSFW')}</Text>
          <Group>
            <Button
              component={NextLink}
              href={`/login?returnUrl=${router.asPath}`}
              leftIcon={<IconKey />}
            >
              {t('Log in to view')}
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
}
