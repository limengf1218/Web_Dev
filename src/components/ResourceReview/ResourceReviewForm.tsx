import { useTranslation } from 'react-i18next';
import { Stack } from '@mantine/core';
import { z } from 'zod';
import { useForm, Form, InputRating, InputRTE } from '~/libs/form';

type FormData = { rating?: number; details?: string };
const schema = z.object({ rating: z.number().min(1), details: z.string().optional() });

export function ResourceReviewForm({
  data,
  onSubmit,
  children,
}: {
  data?: FormData;
  onSubmit?: (data: z.infer<typeof schema>) => void;
  children: React.ReactNode;
}) {
const { t } = useTranslation();
  const form = useForm({ defaultValues: data, schema });

  return (
    <Form form={form} onSubmit={onSubmit}>
      <Stack>
        <InputRating size="xl" name="rating" label={t('Rating')} />
        <InputRTE
          name="details"
          label={t('Comments or feedback')}
          includeControls={['formatting', 'link']}
          editorSize="md"
          // withLinkValidation
        />
        {children}
      </Stack>
    </Form>
  );
}
