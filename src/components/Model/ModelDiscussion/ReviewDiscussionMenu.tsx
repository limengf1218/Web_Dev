import { useTranslation } from 'react-i18next';
import { ActionIcon, MantineNumberSize, Menu, MenuProps, Text } from '@mantine/core';
import { closeAllModals, closeModal, openConfirmModal } from '@mantine/modals';
import {
  IconBan,
  IconCalculator,
  IconCalculatorOff,
  IconDotsVertical,
  IconEdit,
  IconFlag,
  IconLock,
  IconLockOpen,
  IconSwitchHorizontal,
  IconTrash,
} from '@tabler/icons-react';
import { SessionUser } from 'next-auth';

import { LoginRedirect } from '~/components/LoginRedirect/LoginRedirect';
import { openContext } from '~/providers/CustomModalsProvider';
import { closeRoutedContext, openRoutedContext } from '~/providers/RoutedContextProvider';
import { ReportEntity } from '~/server/schema/report.schema';
import { ReviewGetAllItem } from '~/types/router';
import { showErrorNotification } from '~/utils/notifications';
import { trpc } from '~/utils/trpc';

export function ReviewDiscussionMenu({
  review,
  user,
  size = 'xs',
  hideLockOption = false,
  ...props
}: Props) {
const { t } = useTranslation();
  const queryUtils = trpc.useContext();

  const isMod = user?.isModerator ?? false;
  const isOwner = review.user.id === user?.id;
  const isMuted = user?.muted ?? false;

  const deleteMutation = trpc.review.delete.useMutation({
    async onSuccess() {
      await queryUtils.review.getAll.invalidate();
      closeAllModals();
      closeRoutedContext();
    },
    onError(error) {
      showErrorNotification({
        error: new Error(error.message),
        title: t('Could not delete review')as string,
      });
    },
  });
  const handleDeleteReview = () => {
    openConfirmModal({
      title: t('Delete Review'),
      children: (
        <Text size="sm">
          {t('Are you sure you want to delete this review? This action is destructive and cannot be reverted.')}
        </Text>
      ),
      centered: true,
      labels: { confirm: t('Delete Review'), cancel: t("No, don't delete it") },
      confirmProps: { color: 'red', loading: deleteMutation.isLoading },
      closeOnConfirm: false,
      onConfirm: () => {
        deleteMutation.mutate({ id: review.id });
      },
    });
  };

  const excludeMutation = trpc.review.toggleExclude.useMutation({
    async onSuccess() {
      await queryUtils.review.getAll.invalidate();
      closeAllModals();
    },
    onError(error) {
      showErrorNotification({
        error: new Error(error.message),
        title: t('Could not exclude review')as string,
      });
    },
  });
  const handleExcludeReview = () => {
    openConfirmModal({
      title: t('Exclude Review'),
      children: (
        <Text size="sm">
          {t('Are you sure you want to exclude this review from the average score of this model? You will not be able to revert this.')}
        </Text>
      ),
      centered: true,
      labels: { confirm: t('Exclude Review'), cancel: t("No, don't exclude it") },
      confirmProps: { color: 'red', loading: deleteMutation.isLoading },
      closeOnConfirm: false,
      onConfirm: () => {
        excludeMutation.mutate({ id: review.id });
      },
    });
  };
  const handleUnexcludeReview = () => {
    excludeMutation.mutate({ id: review.id });
  };

  const convertToCommentMutation = trpc.review.convertToComment.useMutation({
    async onSuccess() {
      await queryUtils.review.getAll.invalidate();
      await queryUtils.comment.getAll.invalidate();
      closeRoutedContext();
    },
    onError(error) {
      showErrorNotification({
        error: new Error(error.message),
      });
    },
    onSettled() {
      closeAllModals();
    },
  });
  const handleConvertToComment = () => {
    openConfirmModal({
      title: t('Convert to Review'),
      children: (
        <Text size="sm">
          {t('Are you sure you want to convert this review to a comment? You will not be able to revert this.')}
        </Text>
      ),
      centered: true,
      labels: { confirm: t('Convert'), cancel: 'Cancel' },
      confirmProps: { loading: convertToCommentMutation.isLoading },
      closeOnConfirm: false,
      onConfirm: () => {
        convertToCommentMutation.mutate({ id: review.id });
      },
    });
  };

  const toggleLockMutation = trpc.review.toggleLock.useMutation({
    async onMutate({ id }) {
      await queryUtils.review.getDetail.cancel();

      const prevComment = queryUtils.review.getDetail.getData({ id });
      if (prevComment)
        queryUtils.review.getDetail.setData({ id }, () => ({
          ...prevComment,
          locked: !prevComment.locked,
        }));

      return { prevComment };
    },
    async onSuccess() {
      await queryUtils.review.getCommentsById.invalidate({ id: review.id });
    },
    onError(_error, vars, context) {
      showErrorNotification({
        error: new Error('Could not lock the thread, please try again'),
      });
      queryUtils.review.getDetail.setData({ id: vars.id }, context?.prevComment);
    },
  });
  const handleToggleLockThread = () => {
    toggleLockMutation.mutate({ id: review.id });
  };

  const tosViolationMutation = trpc.review.setTosViolation.useMutation({
    async onSuccess() {
      await queryUtils.review.getDetail.invalidate({ id: review.id });
      closeModal('confirm-tos-violation');
      closeRoutedContext();
    },
    onError(error) {
      showErrorNotification({
        error: new Error(error.message),
        title: t('Could not report review, please try again')as string,
      });
    },
  });
  const handleTosViolation = () => {
    openConfirmModal({
      modalId: 'confirm-tos-violation',
      title: t('Report ToS Violation')as string,
      children: t(`Are you sure you want to report this review for a Terms of Service violation? Once marked, it won't show up for other people`)as string,
      centered: true,
      labels: { confirm: 'Yes', cancel: 'Cancel' },
      confirmProps: { color: 'red', loading: tosViolationMutation.isLoading },
      closeOnConfirm: false,
      onConfirm: () => tosViolationMutation.mutate({ id: review.id }),
    });
  };

  return (
    <Menu position="bottom-end" withinPortal {...props}>
      <Menu.Target>
        <ActionIcon size={size} variant="subtle">
          <IconDotsVertical size={14} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {(isOwner || isMod) && (
          <>
            <Menu.Item
              icon={<IconTrash size={14} stroke={1.5} />}
              color="red"
              onClick={handleDeleteReview}
            >
              {t('Delete review')}
            </Menu.Item>
            {((!review.locked && !isMuted) || isMod) && (
              <Menu.Item
                icon={<IconEdit size={14} stroke={1.5} />}
                onClick={() => openRoutedContext('reviewEdit', { reviewId: review.id })}
              >
                {t('Edit review')}
              </Menu.Item>
            )}
            {isMod && !hideLockOption && (
              <Menu.Item
                icon={
                  review.locked ? (
                    <IconLockOpen size={14} stroke={1.5} />
                  ) : (
                    <IconLock size={14} stroke={1.5} />
                  )
                }
                onClick={handleToggleLockThread}
              >
                {review.locked ? 'Unlock review' : 'Lock review'}
              </Menu.Item>
            )}
            {!review.exclude && (
              <Menu.Item
                icon={<IconCalculatorOff size={14} stroke={1.5} />}
                onClick={handleExcludeReview}
              >
                {t('Exclude from average')}
              </Menu.Item>
            )}
            {isMod && (
              <>
                <Menu.Item
                  icon={<IconSwitchHorizontal size={14} stroke={1.5} />}
                  onClick={handleConvertToComment}
                >
                  {t('Convert to comment')}
                </Menu.Item>
                <Menu.Item icon={<IconBan size={14} stroke={1.5} />} onClick={handleTosViolation}>
                  {t('Remove as TOS Violation')}
                </Menu.Item>
              </>
            )}
            {isMod && review.exclude && (
              <Menu.Item
                icon={<IconCalculator size={14} stroke={1.5} />}
                onClick={handleUnexcludeReview}
              >
                {t('Unexclude from average')}
              </Menu.Item>
            )}
          </>
        )}
        {/* {(!user || !isOwner) && (
          <LoginRedirect reason="report-model">
            <Menu.Item
              icon={<IconFlag size={14} stroke={1.5} />}
              onClick={() =>
                openContext('report', { entityType: ReportEntity.Review, entityId: review.id })
              }
            >
              Report
            </Menu.Item>
          </LoginRedirect>
        )} */}
      </Menu.Dropdown>
    </Menu>
  );
}

type Props = MenuProps & {
  review: Pick<ReviewGetAllItem, 'id' | 'exclude' | 'user' | 'locked'>;
  user?: SessionUser | null;
  size?: MantineNumberSize;
  hideLockOption?: boolean;
};
