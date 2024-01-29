import { Group, Stack, Title } from '@mantine/core';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { Announcements } from '~/components/Announcements/Announcements';
import { useArticleQueryParams } from '~/components/Article/article.utils';
import { ArticleCategoriesInfinite } from '~/components/Article/Categories/ArticleCategoriesInfinite';
import { ArticleCategories } from '~/components/Article/Infinite/ArticleCategories';
import { ArticlesInfinite } from '~/components/Article/Infinite/ArticlesInfinite';
import { PeriodFilter, SortFilter, ViewToggle } from '~/components/Filters';
import { HomeContentToggle } from '~/components/HomeContentToggle/HomeContentToggle';
import { MasonryContainer } from '~/components/MasonryColumns/MasonryContainer';
import { MasonryProvider } from '~/components/MasonryColumns/MasonryProvider';
import { ScrollToTopFab } from '~/components/FloatingActionButton/ScrollToTopFab';
import { Meta } from '~/components/Meta/Meta';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { hideMobile, showMobile } from '~/libs/sx-helpers';
import { useFiltersContext } from '~/providers/FiltersProvider';
import { constants } from '~/server/common/constants';
import { getFeatureFlags } from '~/server/services/feature-flags.service';
import { createServerSideProps } from '~/server/utils/server-side-helpers';
import { useIsMobile } from '~/hooks/useIsMobile';
export const getServerSideProps = createServerSideProps({
  useSession: true,
  resolver: async ({ session }) => {
    const features = getFeatureFlags({ user: session?.user });
    if (!features.articles)
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
  },
});

export default function ArticlesPage() {
  const currentUser = useCurrentUser();
  const storedView = useFiltersContext((state) => state.articles.view);
  const { view: queryView, ...filters } = useArticleQueryParams();
  const { t } = useTranslation();
  const view = queryView ?? storedView;
  const isMobile = useIsMobile();
  const titleText = ` Articles | Discover AI-Generated Images with Prompts and Resource Details`;

  return (
    <>
      {/* TODO.articles: update meta title and description accordingly */}
      <Meta
        title={`mikomiko${!currentUser ? titleText : ''}`}
        description={
          t(
            'Browse mikomiko Articles, featuring AI-generated images along with prompts and resources used for their creation, showcasing the creativity of our talented community.'
          ) as string
        }
      />
      <MasonryProvider
        columnWidth={constants.cardSizes.articles}
        maxColumnCount={7}
        maxSingleColumnWidth={450}
      >
        <MasonryContainer fluid>
          {filters.favorites && <Title>{t('Your Bookmarked Articles')}</Title>}
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
                <SortFilter type="articles" />
              </Group>
              <Group spacing={4}>
                <PeriodFilter type="articles" />
                <ViewToggle type="articles" />
              </Group>
            </Group>
            {view === 'categories' ? (
              <ArticleCategoriesInfinite filters={filters} />
            ) : (
              <>
                <ArticleCategories />
                <ArticlesInfinite filters={filters} />
              </>
            )}
          </Stack>
        </MasonryContainer>
      </MasonryProvider>
      <ScrollToTopFab transition="slide-up" />
    </>
  );
}
