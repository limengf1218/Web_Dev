import { useTranslation } from 'react-i18next';
import { Box, SegmentedControl, SegmentedControlItem, SegmentedControlProps } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { useRouter } from 'next/router';
import { useFeatureFlags } from '~/providers/FeatureFlagsProvider';
import { Tooltip } from '@mantine/core';
import { useState } from 'react';

const homeOptions = {
  models: '/',
  images: '/images',
  posts: '/posts',
  articles: '/articles',
} as const;
type HomeOptions = keyof typeof homeOptions;

export function useHomeSelection() {
  const [home, setHome] = useLocalStorage<HomeOptions>({
    key: 'home-selection',
    defaultValue: 'models',
  });

  const url = homeOptions[home];
  const set = (value: HomeOptions) => {
    setHome(value);
    return homeOptions[value];
  };

  return { home, url, set };
}

export function HomeContentToggle({ size, sx, ...props }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { set } = useHomeSelection();
  const features = useFeatureFlags();
  const [urlTooltip, setUrlTooltip] = useState('');

  const data: SegmentedControlItem[] = [
    {
      label: <Box onMouseOver={() => setUrlTooltip('分享查看模型')}>{t('Models')}</Box>,
      value: 'models',
    },
    {
      label: <Box onMouseOver={() => setUrlTooltip('逐张浏览图片')}>{t('Images')}</Box>,
      value: 'images',
    },
    {
      label: <Box onMouseOver={() => setUrlTooltip('一键浏览图集')}>{t('Posts')}</Box>,
      value: 'posts',
    },
  ];
  if (features.articles)
    data.push({
      label: <Box onMouseOver={() => setUrlTooltip('阅读知识精选')}>{t('Articles')}</Box>,
      value: 'articles',
    });
  return (
    <Tooltip.Floating label={urlTooltip} color="blue" position="top">
      <SegmentedControl
        {...props}
        color="blue"
        transitionDuration={0}
        sx={(theme) => ({
          ...(typeof sx === 'function' ? sx(theme) : sx),
        })}
        styles={(theme) => ({
          label: {
            [theme.fn.largerThan('xs')]: {
              paddingTop: 0,
              paddingBottom: 0,
            },
          },
        })}
        value={router.pathname.split('/').pop() || 'models'}
        onChange={(value) => {
          const url = set(value as HomeOptions);
          router.push(url);
        }}
        data={data}
      />
    </Tooltip.Floating>
  );
}

type Props = {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
} & Omit<SegmentedControlProps, 'data' | 'value' | 'onChange'>;