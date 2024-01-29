import { useTranslation } from 'react-i18next';
import { trpc } from '~/utils/trpc';
import { showErrorNotification, showSuccessNotification } from '~/utils/notifications';
import { openConfirmModal } from '@mantine/modals';
import { Text } from '@mantine/core';
import { useRouter } from 'next/router';

export function DeletePostButton({
  children,
  postId,
}: {
  postId: number;
  children: ({
    onClick,
    isLoading,
  }: {
    onClick: () => void;
    isLoading: boolean;
  }) => React.ReactElement;
}) {
const { t } = useTranslation();
  const router = useRouter();
  const queryUtils = trpc.useContext();
  const { mutate, isLoading } = trpc.post.delete.useMutation({
    async onSuccess(_, { id }) {
      // router.push('/posts');
      showSuccessNotification({
        title: t('Post deleted')as string,
        message: t('Successfully deleted post'),
      });
      await router.replace('/');
      await queryUtils.post.get.invalidate({ id });
      await queryUtils.post.getInfinite.invalidate();
    },
    onError(error) {
      showErrorNotification({ title: t('Post delete failed')as string, error: new Error(error.message) });
    },
  });

  const onClick = () => {
    openConfirmModal({
      centered: true,
      title: t('Delete post'),
      children: (
        <Text>
          {t('Are you sure you want to delete this post? The images in this post')}{' '}
          <strong>{t('will also be deleted')}</strong>.
        </Text>
      ),
      labels: { cancel: t(`Cancel`), confirm: t(`Delete Post`) },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        mutate({ id: postId });
      },
    });
  };

  return children({ onClick, isLoading });
}
