import { useTranslation } from 'react-i18next';
import { Card, Group, Title, Button, Stack } from '@mantine/core';
import { signOut } from 'next-auth/react';
import { z } from 'zod';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { Form, InputText, useForm } from '~/libs/form';
import { showSuccessNotification } from '~/utils/notifications';
import { trpc } from '~/utils/trpc';

export function RemoveAccountCard() {
const { t } = useTranslation();
  const user = useCurrentUser();
  const utils = trpc.useContext();

  const { mutate, isLoading, error } = trpc.user.delete.useMutation({
    async onSuccess(user) {
      showSuccessNotification({ message: t('Your account has been removed') });
      signOut();
    },
  });

  const schema = z.object({
    username: z.string().superRefine((val, ctx) => {
      if (val !== user?.username) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('username must match')as string,
        });
      }
    }),
  });

  const form = useForm({ schema });

  return (
    <Card>
      <Title order={2}>{t('Remove Account')}</Title>
      <Form form={form}>
        <Stack>
          <InputText name="username" description={t('Enter your username exactly')} />
          <Group position="right">
            <Button color="red">{t('Remove Account')}</Button>
          </Group>
        </Stack>
      </Form>
    </Card>
  );
}
