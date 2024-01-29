import { Stack, Group, Text, Loader, Center, Divider } from '@mantine/core';
import { CommentsProvider, CreateComment, Comment } from '~/components/CommentsV2';
import { useTranslation } from 'react-i18next';
export function ResourceReviewComments({ reviewId, userId }: { reviewId: number; userId: number }) {
  const { t } = useTranslation();
  return (
    <CommentsProvider
      entityType="review"
      entityId={reviewId}
      limit={3}
      badges={[{ userId, label: 'op', color: 'violet' }]}
    >
      {({ data, created, isLoading, remaining, showMore, toggleShowMore }) =>
        isLoading ? (
          <Center>
            <Loader variant="bars" />
          </Center>
        ) : (
          <Stack>
            <CreateComment />
            {data?.map((comment) => (
              <Comment key={comment.id} comment={comment} />
            ))}
            {!!remaining && !showMore && (
              <Divider
                label={
                  <Group spacing="xs" align="center">
                    <Text variant="link" sx={{ cursor: 'pointer' }} onClick={toggleShowMore}>
                      {t('Show')} {remaining} {t('More')}
                    </Text>
                  </Group>
                }
                labelPosition="center"
                variant="dashed"
              />
            )}
            {created.map((comment) => (
              <Comment key={comment.id} comment={comment} />
            ))}
          </Stack>
        )
      }
    </CommentsProvider>
  );
}
