import { useTranslation } from 'react-i18next';
import { ActionIcon, Button, Group, Popover, Stack, Title } from '@mantine/core';
import { IconExclamationMark } from '@tabler/icons-react';

import { Announcements } from '~/components/Announcements/Announcements';
import { CategoryTags } from '~/components/CategoryTags/CategoryTags';
import { PeriodFilter, SortFilter, ViewToggle } from '~/components/Filters';
import { HomeContentToggle } from '~/components/HomeContentToggle/HomeContentToggle';
import { MasonryContainer } from '~/components/MasonryColumns/MasonryContainer';
import { MasonryProvider } from '~/components/MasonryColumns/MasonryProvider';
import { Meta } from '~/components/Meta/Meta';
import { ScrollToTopFab } from '~/components/FloatingActionButton/ScrollToTopFab';
import { ModelFiltersDropdown } from '~/components/Model/Infinite/ModelFiltersDropdown';
import { ModelsInfinite } from '~/components/Model/Infinite/ModelsInfinite';
import { useModelQueryParams } from '~/components/Model/model.utils';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { hideMobile, showMobile } from '~/libs/sx-helpers';
import { useFiltersContext } from '~/providers/FiltersProvider';
import { constants } from '~/server/common/constants';
import { PeriodMode } from '~/server/schema/base.schema';
import { ModelCategoriesInfinite } from '~/components/Model/Categories/ModelCategoriesInfinite';
import { IsClient } from '~/components/IsClient/IsClient';
import { useIsMobile } from '~/hooks/useIsMobile';

function Home() {
  const { t } = useTranslation();
  const currentUser = useCurrentUser();
  const storedView = useFiltersContext((state) => state.models.view);
  const { set, view: queryView, ...queryFilters } = useModelQueryParams();
  const { username, favorites, hidden, query } = queryFilters;
  const periodMode = query || favorites ? ('stats' as PeriodMode) : undefined;
  if (periodMode) queryFilters.periodMode = periodMode;
  const canToggleView = !username && !favorites && !hidden;
  const view = canToggleView ? queryView ?? storedView : 'feed';
  const isMobile = useIsMobile();
  const titleText = t(` | Stable Diffusion models, embeddings, LoRAs and more`);

  return (
    <>
      <Meta
        title={`mikomiko${!currentUser ? titleText : ''}`}
        description={
          t(
            'mikomiko is a platform for Stable Diffusion AI Art models. Browse a collection of thousands of models from a growing number of creators. Join an engaged community in reviewing models and sharing images with prompts to get you started.'
          ) as string
        }
      />
      <MasonryProvider
        columnWidth={isMobile ? 150 : constants.cardSizes.model}
        maxColumnCount={isMobile ? 2 : 7}
        maxSingleColumnWidth={isMobile ? 150 : 450}
      >
        <MasonryContainer fluid>
          {username && typeof username === 'string' && (
            <Title>
              {t('Models by')} {username}
            </Title>
          )}
          {favorites && <Title>{t('Your Liked Models')}</Title>}
          {hidden && <Title>{t('Your Hidden Models')}</Title>}
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
                <SortFilter type="models" />
              </Group>
              <Group spacing={4}>
                {periodMode && (
                  <Popover>
                    <Popover.Target>
                      <ActionIcon variant="filled" color="blue" radius="xl" size="sm" mr={4}>
                        <IconExclamationMark size={20} strokeWidth={3} />
                      </ActionIcon>
                    </Popover.Target>
                    <Popover.Dropdown maw={300}>
                      {t(
                        `To ensure that you see all possible results, we've disable the period filter.`
                      )}
                      <Button mt="xs" size="xs" fullWidth onClick={() => set({ query: undefined })}>
                        {t('Clear Search')}
                      </Button>
                    </Popover.Dropdown>
                  </Popover>
                )}
                <PeriodFilter type="models" />
                <ModelFiltersDropdown />
                {canToggleView && <ViewToggle type="models" />}
              </Group>
            </Group>
            <IsClient>
              {view === 'categories' ? (
                <ModelCategoriesInfinite />
              ) : (
                <>
                  <CategoryTags />
                  <ModelsInfinite filters={queryFilters} showEof />
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

// Home.getLayout = (page: React.ReactElement) => <>{page}</>;
export default Home;
