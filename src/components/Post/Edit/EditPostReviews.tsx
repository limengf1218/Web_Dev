import { useTranslation } from 'react-i18next';
import { Center, Stack, Alert, Text, Divider } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';

import { useEditPostContext } from '~/components/Post/Edit/EditPostProvider';
import { PostEditImage } from '~/server/controllers/post.controller';
import { trpc } from '~/utils/trpc';
import { EditResourceReview } from '~/components/ResourceReview/EditResourceReview';
import { useEffect, useMemo } from 'react';
import { isDefined } from '~/utils/type-guards';
import { isEqual, uniqWith } from 'lodash-es';
import { DismissibleAlert } from '~/components/DismissibleAlert/DismissibleAlert';
import { useCurrentUser } from '~/hooks/useCurrentUser';

export function EditPostReviews() {
const { t } = useTranslation();
  const currentUser = useCurrentUser();

  const id = useEditPostContext((state) => state.id);
  const items = useEditPostContext((state) => state.images);

  const images = useMemo(
    () => items.filter((x) => x.type === 'image').map((x) => x.data) as PostEditImage[],
    [items]
  );
  const imageResources = useMemo(() => {
    const resources = images
      .flatMap((x) => x.resourceHelper)
      .map(({ modelVersionId, name }) => ({ modelVersionId, name }))
      .filter(isDefined);
    return uniqWith(resources, isEqual);
  }, [images]);
  const missingResources = images.some((x) => !x.resourceHelper.length);

  const { data = [], refetch } = trpc.post.getResources.useQuery({ id }, { enabled: false });
  const isMuted = currentUser?.muted ?? false;

  const reviews = useMemo(() => {
    const previous = [];
    const pending = [];
    if (data) {
      for (const review of data) {
        if (review.reviewCreatedAt) {
          previous.push(review);
        } else {
          pending.push(review);
        }
      }
    }

    return {
      previous,
      pending,
    };
  }, [data]);

  useEffect(() => {
    const shouldRefetch = imageResources.length !== data.length && !isMuted;
    if (shouldRefetch) refetch();
  }, [imageResources, isMuted, refetch]); //eslint-disable-line

  return (
    <Stack mt="lg">
      <Text size="sm" tt="uppercase" weight="bold">
        {t('Resource Reviews')}
      </Text>
      {isMuted ? (
        <Alert color="yellow" icon={<IconLock />}>
          {t('You cannot add reviews because you have been muted')}
        </Alert>
      ) : (
        <>
          {!!reviews.pending.length && (
            <DismissibleAlert
              id="leave-review-alert"
              color="blue"
              title={t('What did you think of the resources you used?')}
              content={t('Take a moment to rate the resources you used in this post by clicking the stars below and optionally leaving a comment about the resource.')}
            />
          )}
          <Stack>
            {reviews.pending.map((resource, index) => (
              <EditResourceReview
                key={resource.modelVersionId ?? resource.name ?? index}
                id={resource.reviewId}
                rating={resource.reviewRating}
                details={resource.reviewDetails}
                createdAt={resource.reviewCreatedAt}
                modelId={resource.modelId}
                modelName={resource.modelName}
                modelVersionId={resource.modelVersionId}
                modelVersionName={resource.modelVersionName}
                name={resource.name}
              />
            ))}
            {reviews.previous.length > 0 && (
              <>
                <Divider label={t('Previously reviewed')} />
                {reviews.previous.map((resource, index) => (
                  <EditResourceReview
                    key={resource.modelVersionId ?? resource.name ?? index}
                    id={resource.reviewId}
                    rating={resource.reviewRating}
                    details={resource.reviewDetails}
                    createdAt={resource.reviewCreatedAt}
                    modelId={resource.modelId}
                    modelName={resource.modelName}
                    modelVersionId={resource.modelVersionId}
                    modelVersionName={resource.modelVersionName}
                    name={resource.name}
                  />
                ))}
              </>
            )}
          </Stack>

          {missingResources && (
            <Alert color="yellow">
              <Text size="xs">
                {t('Some of your images are missing resources. For automatic image resource detection, try installing')}{' '}
                <Text
                  component="a"
                  href="https://github.com/civitai/sd_civitai_extension"
                  target="_blank"
                  variant="link"
                >
                  {t('mikomiko Extension for Automatic 1111 Stable Diffusion Web UI')}
                </Text>
              </Text>
            </Alert>
          )}
        </>
      )}
    </Stack>
  );
}
