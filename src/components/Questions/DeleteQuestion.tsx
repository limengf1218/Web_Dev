import { useTranslation } from 'react-i18next';
import { closeAllModals, openConfirmModal } from '@mantine/modals';
import { useRouter } from 'next/router';
import React from 'react';
import { showSuccessNotification, showErrorNotification } from '~/utils/notifications';
import { trpc } from '~/utils/trpc';
import { Text } from '@mantine/core';

export function DeleteQuestion({ children, id }: { children: React.ReactElement; id: number }) {
const { t } = useTranslation();
  const router = useRouter();

  const { mutate, isLoading } = trpc.question.delete.useMutation({
    onSuccess() {
      showSuccessNotification({
        title: t('Your question has been deleted')as string,
        message: t('Successfully deleted the question')as string,
      });
      closeAllModals();
      router.replace('/questions'); // Redirect to the models or user page once available
    },
    onError(error) {
      showErrorNotification({
        error: new Error(error.message),
        title: t('Could not delete question')as string,
        reason: t('An unexpected error occurred, please try again')as string,
      });
    },
  });

  const handleDeleteQuestion = () => {
    openConfirmModal({
      title: t('Delete question'),
      children: (
        <Text size="sm">
          {t('Are you sure you want to delete this question? This action is destructive and you will have to contact support to restore your data.')}
        </Text>
      ),
      centered: true,
      labels: { confirm: t('Delete question'), cancel: t("No, don't delete it") },
      confirmProps: { color: 'red', loading: isLoading },
      closeOnConfirm: false,
      onConfirm: () => mutate({ id }),
    });
  };

  return React.cloneElement(children, { onClick: handleDeleteQuestion });
}
