import { useTranslation } from 'react-i18next';
import { Box, BoxProps, Divider, SegmentedControl } from '@mantine/core';
import { useRouter } from 'next/router';
import { IsClient } from '~/components/IsClient/IsClient';
import { PeriodModeType, useFiltersContext, useSetFilters } from '~/providers/FiltersProvider';
import { PeriodMode } from '~/server/schema/base.schema';
import { removeEmpty } from '~/utils/object-helpers';
import { useEffect } from 'react';

type Props = {
  type: PeriodModeType;
} & Omit<BoxProps, 'children'>;

export function PeriodModeToggle({ type, ...props }: Props) {
  const { t } = useTranslation();
  const options = [
    { label: t('Stats'), value: 'stats' as PeriodMode },
    { label: t('Published'), value: 'published' as PeriodMode },
  ];
  const { query, pathname, replace } = useRouter();
  const globalValue = useFiltersContext((state) => state[type].periodMode);
  const queryValue = query.periodMode as PeriodMode | undefined;
  const setFilters = useSetFilters(type);

  const value = queryValue ? queryValue : globalValue;
  const setValue = (value: PeriodMode) => {
    if (queryValue && queryValue !== value)
      replace({ pathname, query: removeEmpty({ ...query, view: undefined }) }, undefined, {
        shallow: true,
      });
    setFilters({ periodMode: value });
  };

  return (
    <IsClient>
      <Box {...props}>
        <Divider label={t('Mode')} labelPosition="center" />
        <SegmentedControl data={options} value={value} onChange={setValue} size="xs" />
      </Box>
    </IsClient>
  );
}
