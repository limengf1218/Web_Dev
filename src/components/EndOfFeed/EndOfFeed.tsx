import { useTranslation } from 'react-i18next';
import { Center, Divider, Group, Stack, Text } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';

export function EndOfFeed() {
const { t } = useTranslation();
  return (
    <Stack mt="xl">
      <Divider
        size="sm"
        label={
          <Group spacing={4}>
            <IconClock size={16} stroke={1.5} />
            {t('You are all caught up')}
          </Group>
        }
        labelPosition="center"
        labelProps={{ size: 'sm' }}
      />
      <Center>
        <Stack spacing={0} align="center">
          <Text size="sm" color="dimmed">
            {t('Consider changing your period or filters to find more')}
          </Text>
          <Text
            variant="link"
            size="sm"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            sx={{ cursor: 'pointer' }}
          >
            {t('Back to the top')}
          </Text>
        </Stack>
      </Center>
    </Stack>
  );
}
