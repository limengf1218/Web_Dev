import { useTranslation } from 'react-i18next';
import { Card, Divider, Group, Select, Stack, Switch, Title } from '@mantine/core';

import { useCurrentUser } from '~/hooks/useCurrentUser';
import { constants } from '~/server/common/constants';
import { showSuccessNotification } from '~/utils/notifications';
import { titleCase } from '~/utils/string-helpers';
import { trpc } from '~/utils/trpc';

const validModelFormats = constants.modelFileFormats.filter((format) => format !== 'Other');

export function SettingsCard() {
const { t } = useTranslation();
  const user = useCurrentUser();
  const utils = trpc.useContext();

  const { mutate, isLoading } = trpc.user.update.useMutation({
    async onSuccess() {
      await utils.model.getAll.invalidate();
      await utils.review.getAll.invalidate();
      user?.refresh();
      showSuccessNotification({ message: t('User profile updated') });
    },
  });

  if (!user) return null;

  return (
    <Card withBorder>
      <Stack>
        <Title order={2}>{t('Browsing Settings')}</Title>
        <Divider label={t('Image Preferences')} mb={-12} />
        <Group noWrap grow>
          <Switch
            name="autoplayGifs"
            label={t('Autoplay GIFs')}
            checked={user.autoplayGifs}
            disabled={isLoading}
            onChange={(e) => mutate({ id: user.id, autoplayGifs: e.target.checked })}
          />
          <Select
            label={t('Preferred Format')}
            name="imageFormat"
            data={[
              {
                value: 'optimized',
                label: t('Optimized (avif, webp)')as string,
              },
              {
                value: 'metadata',
                label: t('Unoptimized (jpeg, png)')as string,
              },
            ]}
            value={user.filePreferences?.imageFormat ?? 'metadata'}
            onChange={(value: ImageFormat) =>
              mutate({
                id: user.id,
                filePreferences: { ...user.filePreferences, imageFormat: value },
              })
            }
            disabled={isLoading}
          />
        </Group>

        <Divider label={t('Model File Preferences')} mb={-12} />
        <Group noWrap grow>
          <Select
            label={t('Preferred Format')}
            name="fileFormat"
            data={validModelFormats}
            value={user.filePreferences?.format ?? 'SafeTensor'}
            onChange={(value: ModelFileFormat) =>
              mutate({ id: user.id, filePreferences: { ...user.filePreferences, format: value } })
            }
            disabled={isLoading}
          />
          <Select
            label={t('Preferred Size')}
            name="size"
            data={constants.modelFileSizes.map((size) => ({
              value: size,
              label: titleCase(size),
            }))}
            value={user.filePreferences?.size ?? 'pruned'}
            onChange={(value: ModelFileSize) =>
              mutate({ id: user.id, filePreferences: { ...user.filePreferences, size: value } })
            }
            disabled={isLoading}
          />
          <Select
            label={t('Preferred FP')}
            name="fp"
            data={constants.modelFileFp.map((value) => ({
              value,
              label: value.toUpperCase(),
            }))}
            value={user.filePreferences?.fp ?? 'fp16'}
            onChange={(value: ModelFileFp) =>
              mutate({ id: user.id, filePreferences: { ...user.filePreferences, fp: value } })
            }
            disabled={isLoading}
          />
        </Group>
      </Stack>
    </Card>
  );
}
