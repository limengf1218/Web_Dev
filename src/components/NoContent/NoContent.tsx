import { Stack, StackProps, Text, ThemeIcon } from '@mantine/core';
import { IconCloudOff } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
export function NoContent({
  message,
  ...props
}: Omit<StackProps, 'children' | 'align'> & { message?: string }) {
  const { t } = useTranslation();
  return (
    <Stack {...props} align="center">
      <ThemeIcon size={128} radius={100}>
        <IconCloudOff size={80} />
      </ThemeIcon>
      <Text size={32} align="center">
        {t('No results found')}
      </Text>
      <Text align="center">
        {message ?? "Try adjusting your search or filters to find what you're looking for"}
      </Text>
    </Stack>
  );
}
