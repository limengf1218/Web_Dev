import { MetricTimeframe } from '@prisma/client';
import { useRouter } from 'next/router';
import { PeriodModeToggle } from '~/components/Filters/PeriodModeToggle';
import { IsClient } from '~/components/IsClient/IsClient';
import { SelectMenu } from '~/components/SelectMenu/SelectMenu';
import {
  FilterSubTypes,
  hasPeriodMode,
  PeriodModeType,
  useFiltersContext,
  useSetFilters,
} from '~/providers/FiltersProvider';
import { removeEmpty } from '~/utils/object-helpers';
import { getDisplayName } from '~/utils/string-helpers';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
type PeriodFilterProps = StatefulProps | DumbProps;

const periodOptions = Object.values(MetricTimeframe);
export function PeriodFilter(props: PeriodFilterProps) {
  if (props.value) return <DumbPeriodFilter {...props} />;
  return <StatefulPeriodFilter type={props.type} disabled={props.disabled} />;
}

type DumbProps = {
  type: FilterSubTypes;
  value: MetricTimeframe;
  onChange: (value: MetricTimeframe) => void;
  disabled?: boolean;
  hideMode?: boolean;
};
function DumbPeriodFilter({ value, onChange, disabled, type, hideMode }: DumbProps) {
  const showPeriodMode = !hideMode && hasPeriodMode(type);
  const { t } = useTranslation();
  const time = value;
  const reversedOptions = [...periodOptions].reverse().map((x) => ({ label: t(x), value: x }));
  return (
    <IsClient>
      <SelectMenu
        label={t(time)}
        options={reversedOptions}
        onClick={onChange}
        value={value}
        disabled={disabled}
      >
        {showPeriodMode && <PeriodModeToggle type={type as PeriodModeType} />}
      </SelectMenu>
    </IsClient>
  );
}

type StatefulProps = {
  type: FilterSubTypes;
  disabled?: boolean;
  value?: undefined;
  onChange?: undefined;
  hideMode?: boolean;
};
function StatefulPeriodFilter({ type, disabled, hideMode }: StatefulProps) {
  const { query, pathname, replace } = useRouter();
  const globalPeriod = useFiltersContext((state) => state[type].period);
  const queryPeriod = query.period as typeof globalPeriod | undefined;

  const setFilters = useSetFilters(type);
  const setPeriod = (period: typeof globalPeriod) => {
    if (queryPeriod && queryPeriod !== period)
      replace({ pathname, query: removeEmpty({ ...query, period: undefined }) }, undefined, {
        shallow: true,
      });
    setFilters({ period: period as any });
  };

  const period = queryPeriod ? queryPeriod : globalPeriod;
  return (
    <DumbPeriodFilter
      type={type}
      value={period}
      onChange={setPeriod}
      disabled={disabled}
      hideMode={hideMode}
    />
  );
}
