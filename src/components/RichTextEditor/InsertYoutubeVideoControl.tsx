import { Button, Stack } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { closeAllModals, openModal } from '@mantine/modals';
import {
  RichTextEditor,
  RichTextEditorControlProps,
  useRichTextEditorContext,
} from '@mantine/tiptap';
import { IconBrandYoutube } from '@tabler/icons-react';
import { z } from 'zod';

import { Form, InputText, useForm } from '~/libs/form';

const schema = z.object({
  url: z
    .string()
    .url('Please provide a valid URL')
    .regex(/^(https?\:\/\/)?((www\.)?youtube\.com|youtu\.be)\/.+$/, 'Please provide a YouTube URL'),
});
const controlTitle = 'Insert YouTube video';

export function InsertYoutubeVideoControl(props: Props) {
  const { editor } = useRichTextEditorContext();
  const form = useForm({
    schema,
    defaultValues: { url: '' },
    shouldUnregister: false,
  });
  const { t } = useTranslation();
  const handleSubmit = (values: z.infer<typeof schema>) => {
    const { url } = values;

    editor.commands.setYoutubeVideo({ src: url });
    closeAllModals();
    form.reset();
  };

  const handleClick = () => {
    openModal({
      title: t(controlTitle),
      children: (
        <Form form={form} onSubmit={handleSubmit}>
          <Stack spacing="xs">
            <InputText
              label="YouTube URL"
              name="url"
              placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              withAsterisk
            />
            <Button type="submit" fullWidth>
              {t('Submit')}
            </Button>
          </Stack>
        </Form>
      ),
      onClose: () => form.reset(),
    });
  };

  return (
    <RichTextEditor.Control
      {...props}
      onClick={handleClick}
      aria-label={controlTitle}
      title={controlTitle}
    >
      <IconBrandYoutube size={16} stroke={1.5} />
    </RichTextEditor.Control>
  );
}

type Props = Omit<RichTextEditorControlProps, 'icon' | 'onClick'>;
