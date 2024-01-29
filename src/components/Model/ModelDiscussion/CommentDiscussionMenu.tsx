import { useTranslation } from 'react-i18next';
import { ActionIcon, MantineNumberSize, Menu, MenuProps, Text } from '@mantine/core';
import { closeAllModals, closeModal, openConfirmModal } from '@mantine/modals';
import {
  IconDotsVertical,
  IconTrash,
  IconEdit,
  IconFlag,
  IconLock,
  IconLockOpen,
  IconBan,
} from '@tabler/icons-react';
import { SessionUser } from 'next-auth';

import { LoginRedirect } from '~/components/LoginRedirect/LoginRedirect';
import { openContext } from '~/providers/CustomModalsProvider';
import { closeRoutedContext, openRoutedContext } from '~/providers/RoutedContextProvider';
import { ReportEntity } from '~/server/schema/report.schema';
import { CommentGetAllItem } from '~/types/router';
import { showErrorNotification } from '~/utils/notifications';
import { trpc } from '~/utils/trpc';

export function CommentDiscussionMenu({
  comment,
  user,
  size = 'xs',
  hideLockOption = false,
  ...props
}: Props) {
const { t } = useTranslation();
  const queryUtils = trpc.useContext();

  const isMod = user?.isModerator ?? false;
  const isOwner = comment.user.id === user?.id;
  const isMuted = user?.muted ?? false;

  const deleteMutation = trpc.comment.delete.useMutation({
    async onSuccess() {
      await queryUtils.comment.getAll.invalidate();
      closeAllModals();
      closeRoutedContext();
    },
    onError(error) {
      showErrorNotification({
        error: new Error(error.message),
        title: t('Could not delete comment')as string,
      });
    },
  });
  const handleDeleteComment = () => {
    openConfirmModal({
      title: t('Delete Comment'),
      children: (
        <Text size="sm">
          {t('Are you sure you want to delete this comment? This action is destructive and cannot be reverted.')}
        </Text>
      ),
      centered: true,
      labels: { confirm: t('Delete Comment'), cancel: t("No, don't delete it") },
      confirmProps: { color: 'red', loading: deleteMutation.isLoading },
      closeOnConfirm: false,
      onConfirm: () => {
        deleteMutation.mutate({ id: comment.id });
      },
    });
  };

  const toggleLockMutation = trpc.comment.toggleLock.useMutation({
    async onMutate({ id }) {
      await queryUtils.comment.getById.cancel();

      const prevComment = queryUtils.comment.getById.getData({ id });
      if (prevComment)
        queryUtils.comment.getById.setData({ id }, () => ({
          ...prevComment,
          locked: !prevComment.locked,
        }));

      return { prevComment };
    },
    async onSuccess() {
      await queryUtils.comment.getCommentsById.invalidate({ id: comment.id });
    },
    onError(_error, vars, context) {
      showErrorNotification({
        error: new Error(t('Could not lock the thread, please try again')as string),
      });
      queryUtils.comment.getById.setData({ id: vars.id }, context?.prevComment);
    },
  });
  const handleToggleLockThread = () => {
    toggleLockMutation.mutate({ id: comment.id });
  };

  const tosViolationMutation = trpc.comment.setTosViolation.useMutation({
    async onSuccess() {
      await queryUtils.comment.getById.invalidate({ id: comment.id });
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
      children: t(`Are you sure you want to report this comment for a Terms of Service violation? Once marked, it won't show up for other people`)as string,
      centered: true,
      labels: { confirm: 'Yes', cancel: 'Cancel' },
      confirmProps: { color: 'red', disabled: tosViolationMutation.isLoading },
      closeOnConfirm: false,
      onConfirm: () => tosViolationMutation.mutate({ id: comment.id }),
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
              onClick={handleDeleteComment}
            >
              {t('Delete comment')}
            </Menu.Item>
            {((!comment.locked && !isMuted) || isMod) && (
              <Menu.Item
                icon={<IconEdit size={14} stroke={1.5} />}
                onClick={() => openRoutedContext('commentEdit', { commentId: comment.id })}
              >
                {t('Edit comment')}
              </Menu.Item>
            )}
            {isMod && !hideLockOption && (
              <Menu.Item
                icon={
                  comment.locked ? (
                    <IconLockOpen size={14} stroke={1.5} />
                  ) : (
                    <IconLock size={14} stroke={1.5} />
                  )
                }
                onClick={handleToggleLockThread}
              >
                {comment.locked ? 'Unlock comment' : 'Lock comment'}
              </Menu.Item>
            )}
            {isMod && (
              <Menu.Item icon={<IconBan size={14} stroke={1.5} />} onClick={handleTosViolation}>
                {t('Remove as TOS Violation')}
              </Menu.Item>
            )}
          </>
        )}
        {(!user || !isOwner) && (
          <LoginRedirect reason="report-model">
            <Menu.Item
              icon={<IconFlag size={14} stroke={1.5} />}
              onClick={() =>
                openContext('report', { entityType: ReportEntity.Comment, entityId: comment.id })
              }
            >
              {t('Report')}
            </Menu.Item>
          </LoginRedirect>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}

type Props = MenuProps & {
  comment: Pick<CommentGetAllItem, 'id' | 'user' | 'locked'>;
  user?: SessionUser | null;
  size?: MantineNumberSize;
  hideLockOption?: boolean;
};
