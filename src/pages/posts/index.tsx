import { useTranslation } from 'react-i18next';
import { Group, Stack } from '@mantine/core';
import { Announcements } from '~/components/Announcements/Announcements';
import { PeriodFilter, SortFilter, ViewToggle } from '~/components/Filters';
import { HomeContentToggle } from '~/components/HomeContentToggle/HomeContentToggle';
import { IsClient } from '~/components/IsClient/IsClient';
import { MasonryContainer } from '~/components/MasonryColumns/MasonryContainer';
import { MasonryProvider } from '~/components/MasonryColumns/MasonryProvider';
import { Meta } from '~/components/Meta/Meta';
import { ScrollToTopFab } from '~/components/FloatingActionButton/ScrollToTopFab';
import { PostCategoriesInfinite } from '~/components/Post/Categories/PostCategoriesInfinite';
import { PostCategories } from '~/components/Post/Infinite/PostCategories';
import PostsInfinite from '~/components/Post/Infinite/PostsInfinite';
import { usePostQueryParams } from '~/components/Post/post.utils';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { hideMobile, showMobile } from '~/libs/sx-helpers';
import { useFiltersContext } from '~/providers/FiltersProvider';
import { constants } from '~/server/common/constants';
import { useIsMobile } from '~/hooks/useIsMobile';

export default function PostsPage() {
  const { t } = useTranslation();
  const currentUser = useCurrentUser();
  const storedView = useFiltersContext((state) => state.posts.view);
  const { view: queryView, ...filters } = usePostQueryParams();
  const isMobile = useIsMobile();
  const titleText = ` Posts | Explore Community-Created Content with Custom AI Resources`;

  const view = queryView ?? storedView;
  return (
    <>
      <Meta
        title={`mikomiko${!currentUser ? titleText : ''}`}
        description={
          t(
            'Discover engaging posts from our growing community on mikomiko, featuring unique and creative content generated with custom Stable Diffusion AI resources crafted by talented community members.'
          ) as string
        }
      />
      <MasonryProvider
        columnWidth={isMobile ? 150 : constants.cardSizes.image}
        maxColumnCount={isMobile ? 2 : 7}
        maxSingleColumnWidth={isMobile ? 150 : 450}
      >
        <MasonryContainer fluid>
          <Stack spacing="xs">
            <Announcements
              sx={(theme) => ({
                marginBottom: -35,
                [theme.fn.smallerThan('md')]: {
                  marginBottom: -5,
                },
              })}
            />
            <HomeContentToggle sx={showMobile} />
            <Group position="apart" spacing={0}>
              <Group>
                <HomeContentToggle sx={hideMobile} />
                <SortFilter type="posts" />
              </Group>
              <Group spacing={4}>
                <PeriodFilter type="posts" />
                <ViewToggle type="posts" />
              </Group>
            </Group>
            <IsClient>
              {view === 'categories' ? (
                <PostCategoriesInfinite filters={filters} />
              ) : (
                <>
                  <PostCategories />
                  <PostsInfinite filters={filters} showEof />
                </>
              )}
            </IsClient>
          </Stack>
        </MasonryContainer>
      </MasonryProvider>
      <ScrollToTopFab transition="slide-up" />
    </>
  );
}
