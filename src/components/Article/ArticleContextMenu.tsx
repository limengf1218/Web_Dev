import { useTranslation } from 'react-i18next';
import { ActionIcon, Menu } from '@mantine/core';
import { openConfirmModal } from '@mantine/modals';
import { NextLink } from '@mantine/next';
import { IconBan, IconDotsVertical, IconFlag, IconPencil, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/router';

import { LoginRedirect } from '~/components/LoginRedirect/LoginRedirect';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { openContext } from '~/providers/CustomModalsProvider';
import { ReportEntity } from '~/server/schema/report.schema';
import { ArticleGetAll } from '~/types/router';
import { showErrorNotification, showSuccessNotification } from '~/utils/notifications';
import { trpc } from '~/utils/trpc';

export function ArticleContextMenu({ article }: Props) {
const { t } = useTranslation();
  const queryUtils = trpc.useContext();
  const router = useRouter();
  const currentUser = useCurrentUser();
  const isModerator = currentUser?.isModerator ?? false;
  const isOwner = currentUser?.id === article.user?.id;

  const atDetailsPage = router.pathname === '/articles/[id]/[[...slug]]';

  const deleteArticleMutation = trpc.article.delete.useMutation();
  const handleDeleteArticle = () => {
    openConfirmModal({
      title: t('Delete article'),
      children:
        t('Are you sure you want to delete this article? This action is destructive and cannot be reverted.'),
      labels: { cancel: t("No, don't delete it"), confirm: t('Delete article') },
      confirmProps: { color: 'red' },
      onConfirm: () =>
        deleteArticleMutation.mutate(
          { id: article.id },
          {
            async onSuccess() {
              showSuccessNotification({
                title: t('Article deleted')as string,
                message: t('Successfully deleted article')as string,
              });

              if (atDetailsPage) await router.push('/articles');
              await queryUtils.article.getInfinite.invalidate();
              await queryUtils.article.getByCategory.invalidate();
            },
            onError(error) {
              showErrorNotification({
                title: t('Failed to delete article')as string,
                error: new Error(error.message),
              });
            },
          }
        ),
    });
  };

  const upsertArticleMutation = trpc.article.upsert.useMutation();
  const handleUnpublishArticle = () => {
    upsertArticleMutation.mutate(
      { ...article, publishedAt: null },
      {
        async onSuccess(result) {
          showSuccessNotification({
            title: t('Article unpublished')as string,
            message: t('Successfully unpublished article')as string,
          });

          await queryUtils.article.getById.invalidate({ id: result.id });
          await queryUtils.article.getInfinite.invalidate();
          await queryUtils.article.getByCategory.invalidate();
          await queryUtils.article.getMyDraftArticles.invalidate();
        },
        onError(error) {
          showErrorNotification({
            title: t('Failed to unpublish article')as string,
            error: new Error(error.message),
          });
        },
      }
    );
  };

  return (
    <Menu position="left-start" withArrow offset={-5} withinPortal>
      <Menu.Target>
        <ActionIcon
          variant="transparent"
          p={0}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <IconDotsVertical size={24} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {currentUser && (isOwner || isModerator) && (
          <>
            <Menu.Item
              color="red"
              icon={<IconTrash size={14} stroke={1.5} />}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDeleteArticle();
              }}
              disabled={deleteArticleMutation.isLoading}
            >
              {t('Delete')}
            </Menu.Item>
            {atDetailsPage && (
              <Menu.Item
                color="yellow"
                icon={<IconBan size={14} stroke={1.5} />}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleUnpublishArticle();
                }}
                disabled={upsertArticleMutation.isLoading}
              >
                {t('Unpublish')}
              </Menu.Item>
            )}
            <Menu.Item
              component={NextLink}
              href={`/articles/${article.id}/edit`}
              icon={<IconPencil size={14} stroke={1.5} />}
            >
              {t('Edit')}
            </Menu.Item>
          </>
        )}
        {(!isOwner || isModerator) && (
          <LoginRedirect reason="report-article">
            <Menu.Item
              icon={<IconFlag size={14} stroke={1.5} />}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openContext('report', { entityType: ReportEntity.Article, entityId: article.id });
              }}
            >
              {t('Report article')}
            </Menu.Item>
          </LoginRedirect>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}

type Props = { article: Omit<ArticleGetAll['items'][number], 'stats'> };
