import { ActionIcon, Tooltip } from '@mantine/core';
import { IconLayoutGrid, IconLayoutList } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { IsClient } from '~/components/IsClient/IsClient';
import {
  ViewAdjustableTypes,
  useFiltersContext,
  useSetFilters,
  ViewMode,
} from '~/providers/FiltersProvider';
import { removeEmpty } from '~/utils/object-helpers';
import { useEffect } from 'react';

type Props = {
  type: ViewAdjustableTypes;
};

export function ViewToggle({ type }: Props) {
  const { t } = useTranslation();
  const { query, pathname, replace } = useRouter();
  const globalView = useFiltersContext((state) => state[type].view);
  const queryView = query.view as ViewMode | undefined;
  const setFilters = useSetFilters(type);

  const view = queryView ? queryView : globalView;
  const toggleView = (view: typeof globalView) => {
    const newView = view === 'categories' ? 'feed' : 'categories';
    if (queryView && queryView !== newView)
      replace({ pathname, query: removeEmpty({ ...query, view: undefined }) }, undefined, {
        shallow: true,
      });
    setFilters({ view: newView });
  };

  return (
    <IsClient>
      <Tooltip
        label={`观看 ${view === 'categories' ? t('feed') : t('categories')}`}
        position="bottom"
        withArrow
      >
        <ActionIcon
          color="dark"
          variant="transparent"
          sx={{ width: 40 }}
          onClick={() => toggleView(view === 'categories' ? 'categories' : 'feed')}
        >
          {view === 'categories' ? (
            <IconLayoutGrid size={20} stroke={2.5} />
          ) : (
            <IconLayoutList size={20} stroke={2.5} />
          )}
        </ActionIcon>
      </Tooltip>
    </IsClient>
  );
}
