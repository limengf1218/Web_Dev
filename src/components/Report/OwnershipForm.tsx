import { useTranslation } from 'react-i18next';
import { Alert, Stack, Radio, Text } from '@mantine/core';
import { z } from 'zod';
import { InputText, InputRTE, InputImageUpload, InputRadioGroup } from '~/libs/form';
import { imageSchema } from '~/server/schema/image.schema';
import { reportOwnershipDetailsSchema } from '~/server/schema/report.schema';
import { createReportForm } from './create-report-form';

const schema = reportOwnershipDetailsSchema.extend({
  establishInterest: z.string().transform((x) => (x === 'yes' ? true : false)),
  images: imageSchema.array().transform((images) => images?.map((x) => x.url)),
});

export const OwnershipForm = createReportForm({
  schema,
  Element: ({ props: { setUploading } }) => {
    const { t } = useTranslation();
    return (
      <>
        <Alert>
          <Text>
            {t('If you believe that this model may have been trained using your art, please complete the form below for review. A review of the claim will only be opened if this is placed by the original artist.')}
          </Text>
        </Alert>
        <InputText name="name" label="Name" withAsterisk clearable={false} />
        <InputText
          name="email"
          label="Email"
          description={t('We will contact you at this address to verify the legitimacy of your claim')}
          withAsterisk
          clearable={false}
        />
        <InputText name="phone" label={t('Phone')} clearable={false} />
        <InputRTE name="comment" label="Comment" />
        <InputImageUpload
          name="images"
          label={t('Images for comparison')}
          withMeta={false}
          onChange={(values) => setUploading(values.some((x) => x.file))}
          withAsterisk
        />
        <Stack spacing={4}>
          <InputRadioGroup
            name="establishInterest"
            withAsterisk
            label={t("Are you interested in having an official model of your art style created and attributed to you?")}
            description={
              <Text>
                {t('You would receive 70% of any proceeds made from the use of your model on mikomiko.')}{' '}
                <Text
                  variant="link"
                  component="a"
                  href="/content/au"
                  target="_blank"
                >
                  {t('Learn more')}
                </Text>
              </Text>
            }
          >
            <Radio value="yes" label={t("I'm interested")} />
            <Radio value="no" label={t('Not at this time')} />
          </InputRadioGroup>
        </Stack>
      </>
    );
  },
});
