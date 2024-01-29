import { useTranslation } from 'react-i18next';
import { Button, Group, Stack, Alert, Text, List } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { TRPCClientErrorBase } from '@trpc/client';
import { DefaultErrorShape } from '@trpc/server';
import { z } from 'zod';
import { Form, InputRTE, useForm } from '~/libs/form';
import { GetAnswersProps } from '~/server/controllers/answer.controller';
import { trpc } from '~/utils/trpc';

const schema = z.object({ content: z.string() });

export function AnswerForm({
  answer,
  questionId,
  onCancel,
}: {
  answer?: GetAnswersProps[0];
  questionId: number;
  onCancel?: () => void;
}) {
const { t } = useTranslation();
  const form = useForm({
    schema,
    defaultValues: answer,
  });

  const queryUtils = trpc.useContext();
  const { mutate, isLoading } = trpc.answer.upsert.useMutation({
    async onSuccess(results, input) {
      showNotification({
        title: t('Your answer was saved'),
        message: `Successfully ${!!input.id ? 'updated' : 'created'} the answer.`,
        color: 'teal',
        icon: <IconCheck size={18} />,
      });

      await queryUtils.answer.getAll.invalidate({ questionId });
      onCancel?.();
      form.reset();
    },
    onError(error: TRPCClientErrorBase<DefaultErrorShape>) {
      const message = error.message;

      showNotification({
        title: t('Could not save answer'),
        message: `An error occurred while saving the answer: ${message}`,
        color: 'red',
        icon: <IconX size={18} />,
      });
    },
  });

  const handleSubmit = (values: z.infer<typeof schema>) => {
    // console.log({ ...values, questionId });
    mutate({ ...answer, ...values, questionId });
  };

  return (
    <Form form={form} onSubmit={handleSubmit}>
      <Stack>
        <InputRTE
          name="content"
          withAsterisk
          includeControls={['heading', 'formatting', 'list', 'link', 'media']}
        />
        <Alert color="yellow" variant="light">
          <Text size="sm">{t('Thanks for contributing!')}</Text>
          <List size="sm">
            <List.Item>
              {t('Please be sure to answer the question. Provide details and share your research!')}
            </List.Item>
          </List>
          <Text size="sm">{t('But avoid …')}</Text>
          <List size="sm">
            <List.Item>{t('Asking for help, clarification, or responding to other answers.')}</List.Item>
            <List.Item>
              {t('Making statements based on opinion; back them up with references or personal experience.')}
            </List.Item>
          </List>
        </Alert>
        <Group position="right">
          {onCancel && (
            <Button variant="default" onClick={onCancel}>
              {t('Cancel')}
            </Button>
          )}
          <Button type="submit" loading={isLoading}>
            {answer ? 'Edit' : 'Post'} {t('Your answer')}
          </Button>
        </Group>
      </Stack>
    </Form>
  );
}
