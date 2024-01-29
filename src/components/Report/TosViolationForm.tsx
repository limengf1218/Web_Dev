import { useTranslation } from 'react-i18next';
import { Radio } from '@mantine/core';
import { createReportForm } from '~/components/Report/create-report-form';
import { InputRadioGroup } from '~/libs/form';
import { reportTosViolationDetailsSchema } from '~/server/schema/report.schema';

const violations = [
  'Actual person displayed in NSFW context',
  'Graphic violence',
  'False impersonation',
  'Deceptive content',
  'Sale of illegal substances',
  'Child abuse and exploitation',
  'Photorealistic depiction of a minor',
  'Prohibited prompts',
];

export const TosViolationForm = createReportForm({

  schema: reportTosViolationDetailsSchema,
  Element: () => {
    const { t } = useTranslation();
    return (
      <>
        <InputRadioGroup name="violation" label='Violation' withAsterisk orientation="vertical">
          {violations.map((value, index) => (
            <Radio key={index} value={value} label={t(value)} />
          ))}
        </InputRadioGroup>
      </>
    );
  },
});
