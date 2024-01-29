import { useTranslation } from 'react-i18next';
import { Button, Card, Stack, Text, Title } from '@mantine/core';
import { closeModal, openConfirmModal } from '@mantine/modals';
import { signOut } from 'next-auth/react';

import { useCurrentUser } from '~/hooks/useCurrentUser';
import { showErrorNotification } from '~/utils/notifications';
import { trpc } from '~/utils/trpc';

export function DeleteCard() {
const { t } = useTranslation();
  const currentUser = useCurrentUser();

  const deleteAccountMutation = trpc.user.delete.useMutation({
    async onSuccess() {
      await signOut();
    },
    onError(error) {
      showErrorNotification({ error: new Error(error.message) });
    },
  });
  const handleDeleteAccount = () => {
    openConfirmModal({
      modalId: 'delete-confirm',
      title: t('Delete your account'),
      children: t('Are you sure you want to delete your account? All data will be permanently lost.'),
      centered: true,
      labels: { cancel: t(`Cancel`), confirm: t(`Yes, I am sure`) },
      confirmProps: { color: 'red' },
      closeOnConfirm: false,
      onConfirm: () =>
        openConfirmModal({
          modalId: 'wipe-confirm',
          title: t('Wipe your models'),
          children:
            t('Do you want to delete all the models you have created along with your account?'),
          centered: true,
          closeOnCancel: false,
          closeOnConfirm: false,
          labels: { cancel: t('Yes, wipe them'), confirm: t('No, leave them up') },
          confirmProps: { color: 'red', loading: deleteAccountMutation.isLoading },
          cancelProps: { loading: deleteAccountMutation.isLoading },
          onConfirm: () =>
            currentUser ? deleteAccountMutation.mutateAsync({ ...currentUser }) : undefined,
          onCancel: () =>
            currentUser
              ? deleteAccountMutation.mutateAsync({ ...currentUser, removeModels: true })
              : undefined,
          onClose: () => closeModal('delete-confirm'),
        }),
    });
  };

  return (
    <Card withBorder>
      <Stack>
        <Title order={2}>{t('Delete account')}</Title>
        <Text size="sm">
          {t('Once you delete your account, there is no going back. Please be certain when taking this action.')}
        </Text>
        <Button variant="outline" color="red" onClick={handleDeleteAccount}>
          {t('Delete your account')}
        </Button>
      </Stack>
    </Card>
  );
}
