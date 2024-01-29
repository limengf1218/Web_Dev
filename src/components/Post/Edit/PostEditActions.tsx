import { Stack, Button } from '@mantine/core';
import { useEditPostContext } from '~/components/Post/Edit/EditPostProvider';
import { useTranslation } from 'react-i18next';
import { ReorderImagesButton } from '~/components/Post/Edit/ReorderImages';
import { DeletePostButton } from '~/components/Post/DeletePostButton';
import { IconTrash, IconArrowsSort, IconCheck } from '@tabler/icons-react';

export function PostEditActions() {
  const { t } = useTranslation();
  const id = useEditPostContext((state) => state.id);
  return (
    <Stack spacing="xs">
      <ReorderImagesButton>
        {({ onClick, isLoading, isReordering, canReorder }) => (
          <Button
            onClick={onClick}
            disabled={!canReorder}
            loading={isLoading}
            variant={!isReordering ? 'outline' : undefined}
            leftIcon={isReordering ? <IconCheck /> : <IconArrowsSort />}
          >
            {isReordering ? t('Done Rearranging') : t('Rearrange')}
          </Button>
        )}
      </ReorderImagesButton>
      <DeletePostButton postId={id}>
        {({ onClick, isLoading }) => (
          <Button
            onClick={onClick}
            color="red"
            loading={isLoading}
            variant="outline"
            leftIcon={<IconTrash size={20} />}
          >
            {t('Delete Post')}
          </Button>
        )}
      </DeletePostButton>
    </Stack>
  );
}
