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
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useRef, useState } from 'react';
import { invalidateModeratedContentDebounced } from '~/utils/query-invalidation-utils';

import { trpc } from '~/utils/trpc';

export function HiddenTagsSection() {
  const { t } = useTranslation();
  const queryUtils = trpc.useContext();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 300);

  const { data: blockedTags = [], isLoading: loadingBlockedTags } = trpc.user.getTags.useQuery({
    type: 'Hide',
  });
  const { data, isLoading } = trpc.tag.getAll.useQuery(
    {
      entityType: ['Model'],
      query: debouncedSearch.toLowerCase().trim(),
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
      invalidateModeratedContentDebounced(queryUtils, ['tag']);
    },
    onError(_error, _variables, context) {
      queryUtils.user.getTags.setData({ type: 'Hide' }, context?.prevBlockedTags);
    },
  });
  const handleToggleBlockedTag = (tagId: number) => {
    toggleBlockedTagMutation.mutate({ tagId });
    setSearch('');
  };

  return (
    <>
      <Card.Section withBorder sx={{ marginTop: -1 }}>
        <Autocomplete
          name="tag"
          ref={searchInputRef}
          placeholder={t('Search tags to hide') as string}
          data={modelTags}
          value={search}
          onChange={setSearch}
          icon={isLoading ? <Loader size="xs" /> : <IconSearch size={14} />}
          onItemSubmit={(item: { value: string; id: number }) => {
            handleToggleBlockedTag(item.id);
            searchInputRef.current?.focus();
          }}
          withinPortal
          variant="unstyled"
        />
      </Card.Section>
      <Card.Section inheritPadding pt="md">
        <Stack spacing={5}>
          <Skeleton visible={loadingBlockedTags}>
            {blockedTags.length > 0 && (
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
            )}
          </Skeleton>
          <Text color="dimmed" size="xs">
            {t(`We'll hide content with these tags throughout the site.`)}
          </Text>
        </Stack>
      </Card.Section>
    </>
  );
}
