import { useTranslation } from 'react-i18next';
import { Group, Stack } from '@mantine/core';
import { Announcements } from '~/components/Announcements/Announcements';
import { PeriodFilter, SortFilter, ViewToggle } from '~/components/Filters';
import { HomeContentToggle } from '~/components/HomeContentToggle/HomeContentToggle';
import { ImageCategoriesInfinite } from '~/components/Image/Categories/ImageCategoriesInfinite';
import { ImageCategories } from '~/components/Image/Filters/ImageCategories';
import { ScrollToTopFab } from '~/components/FloatingActionButton/ScrollToTopFab';
import { useImageFilters } from '~/components/Image/image.utils';
import ImagesInfinite from '~/components/Image/Infinite/ImagesInfinite';
import { IsClient } from '~/components/IsClient/IsClient';
import { MasonryContainer } from '~/components/MasonryColumns/MasonryContainer';
import { MasonryProvider } from '~/components/MasonryColumns/MasonryProvider';
import { Meta } from '~/components/Meta/Meta';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { hideMobile, showMobile } from '~/libs/sx-helpers';
import { constants } from '~/server/common/constants';
import { useIsMobile } from '~/hooks/useIsMobile';

export default function ImagesPage() {
  const { t } = useTranslation();
  const currentUser = useCurrentUser();
  const { view } = useImageFilters('images');
  const isMobile = useIsMobile();
  const titleText = ` Image Gallery | Discover AI-Generated Images with Prompts and Resource Details`;

  return (
    <>
      <Meta
        title={`mikomiko${!currentUser ? titleText : ''}`}
        description={
          t(
            'Browse the mikomiko Image Gallery, featuring AI-generated images along with prompts and resources used for their creation, showcasing the creativity of our talented community.'
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
                <SortFilter type="images" />
              </Group>
              <Group spacing={4}>
                <PeriodFilter type="images" />
                <ViewToggle type="images" />
                {/* <ImageFiltersDropdown /> */}
              </Group>
            </Group>
            <IsClient>
              {view === 'categories' ? (
                <ImageCategoriesInfinite />
              ) : (
                <>
                  <ImageCategories />
                  <ImagesInfinite showEof />
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
