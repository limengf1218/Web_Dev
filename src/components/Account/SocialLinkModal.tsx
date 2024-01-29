import { useTranslation } from 'react-i18next';
import { Stack, Button, Modal, Group } from '@mantine/core';
import { LinkType } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { z } from 'zod';
import { useForm, Form, InputText } from '~/libs/form';
import { showErrorNotification } from '~/utils/notifications';
import { zc } from '~/utils/schema-helpers';
import { trpc } from '~/utils/trpc';

const schema = z.object({
  url: zc.safeUrl,
});

export function SocialLinkModal({
  selected,
  onClose,
}: {
  selected?: {
    id?: number;
    type: LinkType;
    url?: string;
  };
  onClose: () => void;
}) {
const { t } = useTranslation();
  const utils = trpc.useContext();
  const { data: session } = useSession();

  const form = useForm({ schema, defaultValues: selected });

  const { mutate, isLoading } = trpc.userLink.upsert.useMutation({
    onSuccess: () => {
      utils.userLink.invalidate();
      onClose();
    },
  });

  const handleSubmit = (data: z.infer<typeof schema>) => {
    if (!session?.user?.id || !selected) return;
    const userId = session.user.id;
    mutate({ ...selected, ...data, userId });
  };

  useEffect(() => {
    form.reset(selected);
  }, [selected]) //eslint-disable-line

  return (
    <Modal opened={!!selected} onClose={onClose} centered withCloseButton={false}>
      <Form
        form={form}
        onSubmit={handleSubmit}
        onError={(err) => {
          console.error(err);
          showErrorNotification({
            error: new Error(t('Please check the fields marked with red to fix the issues.')as string),
            title: t('Form Validation Failed')as string,
          });
        }}
      >
        <Stack>
          <InputText
            name="url"
            label={selected?.type === LinkType.Social ? t('Social Link') : t('Sponsorship Link')}
            required
          />
          <Group position="apart" grow>
            <Button onClick={onClose} variant="default">
              {t('Cancel')}
            </Button>
            <Button loading={isLoading} type="submit">
              {t('Submit')}
            </Button>
          </Group>
        </Stack>
      </Form>
    </Modal>
  );
}
