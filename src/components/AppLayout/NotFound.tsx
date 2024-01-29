import { useTranslation } from 'react-i18next';
import { Button, Container, Stack, Text, Title } from '@mantine/core';
import { NextLink } from '@mantine/next';
import { Meta } from '~/components/Meta/Meta';

export function NotFound() {
const { t } = useTranslation();
  return (
    <>
      <Meta title={t('Page Not Found')} />

      <Container size="xl" p="xl">
        <Stack align="center">
          <Title order={1}>404</Title>
          <Text size="xl">{t("The page you are looking for doesn't exist")}</Text>
          <Button component={NextLink} href="/">
            {t('Go back home')}
          </Button>
        </Stack>
      </Container>
    </>
  );
}
