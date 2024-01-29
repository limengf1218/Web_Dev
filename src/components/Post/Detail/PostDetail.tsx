import { useTranslation } from 'react-i18next';
import {
  ActionIcon,
  Anchor,
  Badge,
  CloseButton,
  Container,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconDotsVertical, IconShare3 } from '@tabler/icons-react';
import { truncate } from 'lodash-es';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getEdgeUrl } from '~/client-utils/cf-images-utils';
import { NotFound } from '~/components/AppLayout/NotFound';
import { NavigateBack } from '~/components/BackButton/BackButton';
import { DaysFromNow } from '~/components/Dates/DaysFromNow';
import { useQueryImages } from '~/components/Image/image.utils';
import { Meta } from '~/components/Meta/Meta';
import { PageLoader } from '~/components/PageLoader/PageLoader';
import { PostComments } from '~/components/Post/Detail/PostComments';
import { PostControls } from '~/components/Post/Detail/PostControls';
import { PostImages } from '~/components/Post/Detail/PostImages';
import { RenderHtml } from '~/components/RenderHtml/RenderHtml';
import { UserAvatar } from '~/components/UserAvatar/UserAvatar';
import { TrackView } from '~/components/TrackView/TrackView';
import { daysFromNow } from '~/utils/date-helpers';
import { removeTags } from '~/utils/string-helpers';
import { trpc } from '~/utils/trpc';
import { ShareButton } from '~/components/ShareButton/ShareButton';

export function PostDetail({ postId }: { postId: number }) {
const { t } = useTranslation();
  const router = useRouter();
  const { data: post, isLoading: postLoading } = trpc.post.get.useQuery({ id: postId });
  const { images, isLoading: imagesLoading } = useQueryImages({ postId });
  const { data: postResources = [] } = trpc.post.getResources.useQuery({ id: postId });

  if (postLoading) return <PageLoader />;
  if (!post) return <NotFound />;

  const relatedResource = postResources.find(
    (resource) => resource.modelVersionId === post.modelVersionId
  );

  return (
    <>
      <Meta
        title={post.title ?? `Image post by ${post.user.username}`}
        description={truncate(removeTags(post.detail ?? ''), { length: 150 })}
        image={images[0]?.url == null ? undefined : getEdgeUrl(images[0].url, { width: 1200 })}
      />
      <TrackView entityId={post.id} entityType="Post" type="PostView" />
      <Container size="sm">
        <Stack>
          <Stack spacing="xs">
            {post.title && (
              <Title sx={{ lineHeight: 1 }} order={2}>
                {post.title}
              </Title>
            )}
            <Group position="apart" noWrap>
              {!!post.tags.length ? (
                <Group spacing={4}>
                  {post.tags.map((tag) => (
                    <Badge key={tag.id} color="gray" variant="filled">
                      {tag.name}
                    </Badge>
                  ))}
                </Group>
              ) : (
                <div />
              )}
              <Group spacing="xs" noWrap>
                <ShareButton
                  url={`/posts/${post.id}`}
                  title={post.title ?? `Post by ${post.user.username}`}
                >
                  <ActionIcon color="gray" variant="filled">
                    <IconShare3 size={16} />
                  </ActionIcon>
                </ShareButton>
                <PostControls postId={post.id} userId={post.user.id}>
                  <ActionIcon variant="outline">
                    <IconDotsVertical size={16} />
                  </ActionIcon>
                </PostControls>
                {router.query.modal && (
                  <NavigateBack url="/posts">
                    {({ onClick }) => <CloseButton onClick={onClick} size="lg" />}
                  </NavigateBack>
                )}
              </Group>
            </Group>
            <UserAvatar
              user={post.user}
              size="md"
              subTextSize="sm"
              textSize="md"
              subText={
                <>
                  {relatedResource && (
                    <>
                      {t('Posted to')}{' '}
                      <Link
                        href={`/models/${relatedResource.modelId}?modelVersionId=${relatedResource.modelVersionId}`}
                        passHref
                      >
                        <Anchor>
                          {relatedResource.modelName} - {relatedResource.modelVersionName}
                        </Anchor>
                      </Link>{' '}
                    </>
                  )}
                  {post.publishedAt ? <DaysFromNow date={post.publishedAt} /> : null}
                </>
              }
              withUsername
              linkToProfile
              subTextForce
            />
          </Stack>
          <PostImages postId={post.id} images={images} isLoading={imagesLoading} />
          <Stack spacing="xl" id="comments">
            {post.detail && <RenderHtml html={post.detail} withMentions />}
            <PostComments postId={postId} userId={post.user.id} />
          </Stack>
        </Stack>
      </Container>
    </>
  );
}
