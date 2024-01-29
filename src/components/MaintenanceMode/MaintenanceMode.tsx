import { useTranslation } from 'react-i18next';
import { Center, Stack, Text, ThemeIcon, Image } from '@mantine/core';
import { IconHourglass } from '@tabler/icons-react';
import { Meta } from '~/components/Meta/Meta';

export const MaintenanceMode = () => {
  const { t } = useTranslation();
  return (
    <>
      <Meta
        title={t("We'll be right back | mikomiko")}
        description={t("We're adjusting a few things, be back in a few minutes...")as string}
      />
      <Center p="xl" sx={{ height: '100vh' }}>
        <Stack align="center">
          <ThemeIcon size={128} radius={100}>
            <IconHourglass size={80} />
          </ThemeIcon>
          <Text align="center" size="xl" weight={500}>
            {t(`We're adjusting a few things, be back in a few minutes...`)}
          </Text>
          <Image src="/images/imrs.webp" alt='This is fine' />
        </Stack>
      </Center>
    </>
  );
};
