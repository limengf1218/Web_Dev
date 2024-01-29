import { useTranslation } from 'react-i18next';
import {
  ActionIcon,
  Autocomplete,
  Badge,
  Card,
  Center,
  Group,
  Loader,
  LoadingOverlay,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useDebouncedState } from '@mantine/hooks';
import { IconSearch, IconX } from '@tabler/icons-react';

import { trpc } from '~/utils/trpc';

export function TagsCard() {
const { t } = useTranslation();
  const queryUtils = trpc.useContext();
  const [search, setSearch] = useDebouncedState('', 300);

  const { data: blockedTags = [], isLoading: loadingBlockedTags } = trpc.user.getTags.useQuery({
    type: 'Hide',
  });
  const { data, isLoading } = trpc.tag.getAll.useQuery(
    {
      entityType: ['Model'],
      query: search.toLowerCase().trim(),
    },
    { enabled: !loadingBlockedTags }
  );
  const modelTags = data?.items.map(({ id, name }) => ({ id, value: name })) ?? [];

  const toggleBlockedTagMutation = trpc.user.toggleBlockedTag.useMutation({
    async onMutate({ tagId }) {
      await queryUtils.user.getTags.cancel();

      const prevBlockedTags = queryUtils.user.getTags.getData({ type: 'Hide' }) ?? [];
      const removing = prevBlockedTags.some((tag) => tag.id === tagId);

      queryUtils.user.getTags.setData({ type: 'Hide' }, (old = []) => {
        if (removing) return old.filter((tag) => tag.id !== tagId);

        const { models, ...addedTag } = data?.items.find((tag) => tag.id === tagId) ?? {
          id: tagId,
          name: '',
        };
        return [...old, addedTag];
      });

      return { prevBlockedTags };
    },
    async onSuccess() {
      await queryUtils.model.getAll.invalidate();
    },
    onError(_error, _variables, context) {
      queryUtils.user.getTags.setData({ type: 'Hide' }, context?.prevBlockedTags);
    },
    async onSettled() {
      await queryUtils.user.getTags.invalidate({ type: 'Hide' });
    },
  });
  const handleToggleBlockedTag = (tagId: number) => {
    toggleBlockedTagMutation.mutate({ tagId });
    setSearch('');
  };

  return (
    <Card withBorder>
      <Stack spacing={0}>
        <Title order={2}>{t('Hidden Tags')}</Title>
        <Text color="dimmed" size="sm">
          {t('You will stop seeing models that contain tags you have blocked. Use the input below to manage them.')}
        </Text>
      </Stack>
      <Stack mt="md">
        <Autocomplete
          name="tag"
          placeholder={t("Search tags to hide")as string}
          data={modelTags}
          onChange={setSearch}
          icon={isLoading ? <Loader size="xs" /> : <IconSearch size={14} />}
          onItemSubmit={(item: { value: string; id: number }) => handleToggleBlockedTag(item.id)}
          withinPortal
        />
        <Paper p="xs" radius="md" sx={{ position: 'relative' }} withBorder>
          <LoadingOverlay visible={loadingBlockedTags} />
          {blockedTags.length > 0 ? (
            <Group spacing={4}>
              {blockedTags.map((tag) => (
                <Badge
                  key={tag.id}
                  sx={{ paddingRight: 3 }}
                  rightSection={
                    <ActionIcon
                      size="xs"
                      color="blue"
                      radius="xl"
                      variant="transparent"
                      onClick={() => handleToggleBlockedTag(tag.id)}
                    >
                      <IconX size={10} />
                    </ActionIcon>
                  }
                >
                  {tag.name}
                </Badge>
              ))}
            </Group>
          ) : (
            <Center>
              <Stack spacing={2}>
                <Text weight="bold">{t('No hidden tags')}</Text>
                <Text size="sm" color="dimmed">
                  {t('You can add tags by using the search input above.')}
                </Text>
              </Stack>
            </Center>
          )}
        </Paper>
      </Stack>
    </Card>
  );
}
