import { useTranslation } from 'react-i18next';
import React, { useMemo } from 'react';
import { createReportForm } from './create-report-form';
import { withWatcher } from '~/libs/form/hoc/withWatcher';
import { withController } from '~/libs/form/hoc/withController';
import { reportNsfwDetailsSchema } from '~/server/schema/report.schema';
import { Accordion, Badge, Chip, Group, Input, InputWrapperProps, Text, Checkbox } from '@mantine/core';
import { entityModerationCategories } from '~/libs/moderation';
import { InputTextArea } from '~/libs/form';
import { TagVotableEntityType } from '~/libs/tags';
import { z } from 'zod';

export const ImageNsfwForm = createReportForm({
  schema: reportNsfwDetailsSchema.extend({
    tags: z.array(z.string()).min(1, 'Please select at least one reason'),
  }),
  Element: () => {
    const { t } = useTranslation();
    return (
      <>
        <InputModerationTags type="image" name="tags" label={t('Select all that apply')} required />
        <InputTextArea name="comment" label={t("Comment (optional)")} />
      </>
    );
  },
});

export const ModelNsfwForm = createReportForm({
  schema: reportNsfwDetailsSchema.extend({
    tags: z.array(z.string()).min(1, 'Please select at least one reason'),
  }),
  Element: () => {
    const { t } = useTranslation();
    return (
      <>
        <InputModerationTags type="model" name="tags" label={t('Select all that apply')} required />
        <InputTextArea name="comment" label={t("Comment (optional)")} />
      </>
    );
  },
});

export const ArticleNsfwForm = createReportForm({
  schema: reportNsfwDetailsSchema,
  Element: () => {
    const { t } = useTranslation();
    return (
      <>
        <InputTextArea name="comment" label={t("Comment (optional)")} />
      </>
    );
  },
});

type ModerationTagsInputProps = Omit<InputWrapperProps, 'children' | 'onChange'> & {
  value?: string[];
  type: TagVotableEntityType;
  onChange?: (value: string[]) => void;
};

const defaultAccordions: Record<TagVotableEntityType, string[]> = {
  model: ['explicit nudity'],
  image: ['suggestive', 'explicit nudity'],
};
function ModerationTagsInput({ value = [], onChange, type, ...props }: ModerationTagsInputProps) {
  value = Array.isArray(value) ? value : value ? [value] : [];

  const toggleTag = (tag: string) => {
    const updated = value.includes(tag) ? value.filter((x) => x !== tag) : [...value, tag];
    onChange?.(updated);
  };

  const moderationCategories = useMemo(() => entityModerationCategories[type], [type]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const category of moderationCategories) {
      counts[category.value] = 0;
      for (const child of category.children ?? [])
        if (value.includes(child.value)) counts[category.value] += 1;
    }
    return counts;
  }, [value]);
  const { t } = useTranslation();
  return (
    <Input.Wrapper {...props}>
      <Accordion defaultValue={defaultAccordions[type]} variant="contained" multiple>
        {moderationCategories
          .filter((x) => !!x.children?.length && !x.noInput)
          .map((category) => {
            const count = categoryCounts[category.value];
            return (
              <Accordion.Item key={category.value} value={category.value}>
               
                  <Group position="apart" spacing={200}>
                    <Text weight={500}>{t(category.label)}</Text>
                    {count && <Badge>{count}</Badge>}
                    <Checkbox
                      checked={value.includes(category.value)}
                      onChange={() => toggleTag(category.value)}
                    />
                  </Group>
                
              </Accordion.Item>
            );
          })}
      </Accordion>

    </Input.Wrapper>
  );
}
const InputModerationTags = withWatcher(withController(ModerationTagsInput));
