import { useTranslation } from 'react-i18next';
import { closeAllModals, openConfirmModal } from '@mantine/modals';
import React from 'react';
import { showSuccessNotification, showErrorNotification } from '~/utils/notifications';
import { trpc } from '~/utils/trpc';
import { Text } from '@mantine/core';

export function DeleteAnswer({ children, id }: { children: React.ReactElement; id: number }) {
const { t } = useTranslation();
  const { mutate, isLoading } = trpc.answer.delete.useMutation({
    onSuccess() {
      showSuccessNotification({
        title: t('Your answer has been deleted')as string,
        message: t('Successfully deleted the answer')as string,
      });
      closeAllModals();
    },
    onError(error) {
      showErrorNotification({
        error: new Error(error.message),
        title: t('Could not delete answer')as string,
        reason: t('An unexpected error occurred, please try again')as string,
      });
    },
  });

  const handleDeleteAnswer = () => {
    openConfirmModal({
      title: t('Delete answer')as string,
      children: (
        <Text size="sm">
          {t('Are you sure you want to delete this answer? This action is destructive and you will have to contact support to restore your data.')}
        </Text>
      ),
      centered: true,
      labels: { confirm: t('Delete answer'), cancel: t("No, don't delete it") },
      confirmProps: { color: 'red', loading: isLoading },
      closeOnConfirm: false,
      onConfirm: () => mutate({ id }),
    });
  };

  return React.cloneElement(children, { onClick: handleDeleteAnswer });
}
