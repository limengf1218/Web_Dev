import { SelectMenu } from '~/components/SelectMenu/SelectMenu';
import { FilterSubTypes, useFiltersContext } from '~/providers/FiltersProviderOld';
import { ImageSort, ModelSort, PostSort, QuestionSort } from '~/server/common/enums';
import { useTranslation } from 'react-i18next';
type SortFilterProps = {
  type: FilterSubTypes;
};

function getSortOptions(type: FilterSubTypes) {
  switch (type) {
    case 'model':
      return ModelSort;
    case 'post':
      return PostSort;
    case 'image':
      return ImageSort;
    case 'question':
      return QuestionSort;
    default:
      throw new Error(`unhandled SortFilter type: ${type}`);
  }
}

export function SortFilter({ type }: SortFilterProps) {
  const { t } = useTranslation();
  const sortOptions = Object.values(getSortOptions(type));
  const sort = useFiltersContext((state) => state[type].sort);
  const setFilters = useFiltersContext((state) => state.setFilters);
  return (
    <SelectMenu
      label={sort}
      options={sortOptions.map((x) => ({ label: x, value: x }))}
      onClick={(sort) => setFilters({ [type]: { sort } })}
      value={sort}
    />
  );
}
