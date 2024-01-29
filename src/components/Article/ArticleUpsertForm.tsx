import { useTranslation } from 'react-i18next';
import {
  Anchor,
  Button,
  ButtonProps,
  Grid,
  Group,
  Stack,
  StackProps,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
  TooltipProps,
  createStyles,
} from '@mantine/core';
import { TagTarget } from '@prisma/client';
import { IconQuestionMark } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { z } from 'zod';

import { BackButton } from '~/components/BackButton/BackButton';
import { hiddenLabel, matureLabel } from '~/components/Post/Edit/EditPostControls';
import { useFormStorage } from '~/hooks/useFormStorage';
import {
  Form,
  InputCheckbox,
  InputMultiFileUpload,
  InputRTE,
  InputSelect,
  InputSimpleImageUpload,
  InputTags,
  InputText,
  useForm,
} from '~/libs/form';
import { hideMobile, showMobile } from '~/libs/sx-helpers';
import { upsertArticleInput } from '~/server/schema/article.schema';
import { ArticleGetById } from '~/types/router';
import { formatDate } from '~/utils/date-helpers';
import { showErrorNotification } from '~/utils/notifications';
import { parseNumericString } from '~/utils/query-string-helpers';
import { titleCase } from '~/utils/string-helpers';
import { trpc } from '~/utils/trpc';

const schema = upsertArticleInput.extend({
  categoryId: z.number(),
});
const querySchema = z.object({
  category: z.preprocess(parseNumericString, z.number().optional()),
});

const tooltipProps: Partial<TooltipProps> = {
  maw: 300,
  multiline: true,
  position: 'bottom',
  withArrow: true,
};

const useStyles = createStyles((theme) => ({
  sidebar: {
    position: 'sticky',
    top: 70 + theme.spacing.xl,
  },
}));

export function ArticleUpsertForm({ article }: Props) {
const { t } = useTranslation();
  const { classes } = useStyles();
  const queryUtils = trpc.useContext();
  const router = useRouter();
  const result = querySchema.safeParse(router.query);

  const defaultCategory = result.success ? result.data.category : undefined;
  const defaultValues = {
    ...article,
    title: article?.title ?? '',
    content: article?.content,
    categoryId: article?.tags.find((tag) => tag.isCategory)?.id ?? defaultCategory,
    tags: article?.tags.filter((tag) => !tag.isCategory) ?? [],
  };
  const form = useForm({ schema, defaultValues, shouldUnregister: false });
  const clearStorage = useFormStorage({
    schema,
    form,
    timeout: 1000,
    key: `article${article?.id ? `_${article?.id}` : 'new'}`,
    watch: ({ content, cover, categoryId, nsfw, tags, title }) => ({
      content,
      cover,
      categoryId,
      nsfw,
      tags,
      title,
    }),
  });
  const [publishing, setPublishing] = useState(false);

  const { data, isLoading: loadingCategories } = trpc.tag.getAll.useQuery({
    categories: true,
    entityType: [TagTarget.Article],
    unlisted: false,
    limit: 100,
  });
  const categories =
    data?.items.map((tag) => ({ label: titleCase(tag.name), value: tag.id })) ?? [];

  const upsertArticleMutation = trpc.article.upsert.useMutation();

  const handleSubmit = ({ categoryId, tags: selectedTags, ...rest }: z.infer<typeof schema>) => {
    const selectedCategory = data?.items.find((cat) => cat.id === categoryId);
    const tags =
      selectedTags && selectedCategory ? selectedTags.concat([selectedCategory]) : selectedTags;
    upsertArticleMutation.mutate(
      { ...rest, tags, publishedAt: publishing ? new Date() : null },
      {
        async onSuccess(result) {
          await router.push(`/articles/${result.id}`);
          await queryUtils.article.getById.invalidate({ id: result.id });
          await queryUtils.article.getInfinite.invalidate();
          await queryUtils.article.getByCategory.invalidate();
          clearStorage();
        },
        onError(error) {
          showErrorNotification({
            title: t('Failed to save article')as string,
            error: new Error(error.message),
          });
        },
      }
    );
  };

  return (
    <Form form={form} onSubmit={handleSubmit}>
      <Grid gutter="xl">
        <Grid.Col xs={12} md={8}>
          <Stack spacing="xl">
            <Group spacing={4}>
              <BackButton url="/articles" />
              <Title>{article?.id ? t('Editing article') : t('Create an article')}</Title>
            </Group>
            <InputText
              name="title"
              label={t('Title')}
              placeholder={t('e.g.: How to create your own LoRA')as string}
              withAsterisk
            />
            <InputRTE
              name="content"
              label={t('Content')}
              editorSize="xl"
              includeControls={[
                'heading',
                'formatting',
                'list',
                'link',
                'media',
                'polls',
                'colors',
              ]}
              withAsterisk
              stickyToolbar
            />
          </Stack>
        </Grid.Col>
        <Grid.Col xs={12} md={4}>
          <Stack className={classes.sidebar} spacing="xl">
            <ActionButtons
              article={article}
              saveButtonProps={{
                loading: upsertArticleMutation.isLoading && !publishing,
                disabled: upsertArticleMutation.isLoading,
                onClick: () => setPublishing(false),
              }}
              publishButtonProps={{
                loading: upsertArticleMutation.isLoading && publishing,
                disabled: upsertArticleMutation.isLoading,
                onClick: () => setPublishing(true),
              }}
              sx={hideMobile}
            />
            <InputCheckbox
              name="nsfw"
              label={
                <Group spacing={4}>
                  {t('Mature')}
                  <Tooltip label={matureLabel} {...tooltipProps}>
                    <ThemeIcon radius="xl" size="xs" color="gray">
                      <IconQuestionMark />
                    </ThemeIcon>
                  </Tooltip>
                </Group>
              }
            />
            <InputSimpleImageUpload name="cover" label={t('Cover Image')} withAsterisk />
            <InputSelect
              name="categoryId"
              label={t('Category')}
              placeholder={t('Select a category')as string}
              data={categories}
              nothingFound={t('Nothing found')}
              loading={loadingCategories}
              withAsterisk
            />
            <InputTags
              name="tags"
              label={t('Tags')}
              target={[TagTarget.Article]}
              filter={(tag) =>
                data && tag.name ? !data.items.map((cat) => cat.name).includes(tag.name) : true
              }
            />
            <InputMultiFileUpload
              name="attachments"
              label={t('Attachments')}
              dropzoneProps={{
                maxSize: 30 * 1024 ** 2, // 30MB
                maxFiles: 10,
                accept: {
                  'application/pdf': ['.pdf'],
                  'application/zip': ['.zip'],
                  'application/json': ['.json'],
                  'application/x-yaml': ['.yaml', '.yml'],
                  'text/plain': ['.txt'],
                  'text/markdown': ['.md'],
                  'text/x-python-script': ['.py'],
                },
              }}
              renderItem={(file) =>
                article && file.id ? (
                  <Anchor href={`/api/download/attachments/${file.id}`} lineClamp={1} download>
                    {file.name}
                  </Anchor>
                ) : (
                  file.name
                )
              }
            />
            <ActionButtons
              article={article}
              saveButtonProps={{
                loading: upsertArticleMutation.isLoading && !publishing,
                disabled: upsertArticleMutation.isLoading,
                onClick: () => setPublishing(false),
              }}
              publishButtonProps={{
                loading: upsertArticleMutation.isLoading && publishing,
                disabled: upsertArticleMutation.isLoading,
                onClick: () => setPublishing(true),
              }}
              sx={showMobile}
            />
          </Stack>
        </Grid.Col>
      </Grid>
    </Form>
  );
}

type Props = { article?: ArticleGetById };

function ActionButtons({
  article,
  className,
  saveButtonProps,
  publishButtonProps,
  ...stackProps
}: ActionButtonProps) {
const { t } = useTranslation();
  return (
    <Stack spacing={8} {...stackProps}>
      {article?.publishedAt ? (
        <Button {...publishButtonProps} type="submit" fullWidth>
          {t('Save')}
        </Button>
      ) : (
        <>
          <Button {...saveButtonProps} type="submit" variant="default" fullWidth>
            {t('Save Draft')}
          </Button>
          <Button {...publishButtonProps} type="submit" fullWidth>
            {t('Publish')}
          </Button>
        </>
      )}
      {article?.publishedAt ? (
        <Text size="xs" color="dimmed">
          {t('Published at')} {formatDate(article.publishedAt)}
        </Text>
      ) : (
        <Text size="xs" color="dimmed">
          {t('Your article is currently')}{' '}
          <Tooltip label={hiddenLabel} {...tooltipProps}>
            <Text span underline>
              {t('hidden')}
            </Text>
          </Tooltip>
        </Text>
      )}
    </Stack>
  );
}

type FormButtonProps = Pick<ButtonProps, 'disabled' | 'loading'> & {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
};

type ActionButtonProps = StackProps & {
  saveButtonProps: FormButtonProps;
  publishButtonProps: FormButtonProps;
  article?: ArticleGetById;
};
