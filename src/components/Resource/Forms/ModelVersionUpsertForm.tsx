import { useTranslation } from 'react-i18next';
import { Group, Input, Stack, Text } from '@mantine/core';
import { NextLink } from '@mantine/next';
import { useEffect } from 'react';
import { z } from 'zod';

import { DismissibleAlert } from '~/components/DismissibleAlert/DismissibleAlert';
import {
  Form,
  InputMultiSelect,
  InputNumber,
  InputRTE,
  InputSegmentedControl,
  InputSelect,
  InputSwitch,
  InputText,
  useForm,
} from '~/libs/form';
import { useFeatureFlags } from '~/providers/FeatureFlagsProvider';
import { constants } from '~/server/common/constants';
import {
  ModelVersionUpsertInput,
  modelVersionUpsertSchema2,
} from '~/server/schema/model-version.schema';
import { ModelUpsertInput } from '~/server/schema/model.schema';
import { isEarlyAccess } from '~/server/utils/early-access-helpers';
import { showErrorNotification } from '~/utils/notifications';
import { trpc } from '~/utils/trpc';

const schema = modelVersionUpsertSchema2
  .extend({
    skipTrainedWords: z.boolean().default(false),
    earlyAccessTimeFrame: z
      .string()
      .refine((value) => ['0', '1', '2', '3', '4', '5'].includes(value), {
        message: 'Invalid value',
      }),
  })
  .refine((data) => (!data.skipTrainedWords ? data.trainedWords.length > 0 : true), {
    message: 'You need to specify at least one trained word',
    path: ['trainedWords'],
  });
type Schema = z.infer<typeof schema>;

export function ModelVersionUpsertForm({ model, version, children, onSubmit }: Props) {
const { t } = useTranslation();
  const features = useFeatureFlags();
  const queryUtils = trpc.useContext();

  const acceptsTrainedWords = [
    'Checkpoint',
    'TextualInversion',
    'LORA',
    'LoCon',
    'Wildcards',
  ].includes(model?.type ?? '');
  const isTextualInversion = model?.type === 'TextualInversion';

  const defaultValues: Schema = {
    ...version,
    name: version?.name ?? 'v1.0',
    baseModel: version?.baseModel ?? 'SD 1.5',
    trainedWords: version?.trainedWords ?? [],
    skipTrainedWords: acceptsTrainedWords
      ? version?.trainedWords
        ? !version.trainedWords.length
        : false
      : true,
    earlyAccessTimeFrame:
      version?.earlyAccessTimeFrame && features.earlyAccessModel
        ? String(version.earlyAccessTimeFrame)
        : '0',
    modelId: model?.id ?? -1,
    description: version?.description ?? null,
    epochs: version?.epochs ?? null,
    steps: version?.steps ?? null,
  };
  const form = useForm({ schema, defaultValues, shouldUnregister: false, mode: 'onChange' });

  const skipTrainedWords = !isTextualInversion && (form.watch('skipTrainedWords') ?? false);
  const trainedWords = form.watch('trainedWords') ?? [];
  const { isDirty } = form.formState;

  const upsertVersionMutation = trpc.modelVersion.upsert.useMutation({
    onError(error) {
      showErrorNotification({
        error: new Error(error.message),
        title: t('Failed to saved model version')as string,
      });
    },
  });
  const handleSubmit = async (data: Schema) => {
    if (isDirty || !version?.id) {
      const result = await upsertVersionMutation.mutateAsync({
        ...data,
        modelId: model?.id ?? -1,
        earlyAccessTimeFrame: Number(data.earlyAccessTimeFrame),
        trainedWords: skipTrainedWords ? [] : trainedWords,
      });
      await queryUtils.modelVersion.getById.invalidate();
      if (model) await queryUtils.model.getById.invalidate({ id: model.id });
      onSubmit(result as ModelVersionUpsertInput);
    } else {
      onSubmit(version as ModelVersionUpsertInput);
    }
  };

  useEffect(() => {
    if (version)
      form.reset({
        ...version,
        modelId: version.modelId ?? model?.id ?? -1,
        baseModel: version.baseModel,
        skipTrainedWords: isTextualInversion
          ? false
          : acceptsTrainedWords
          ? version?.trainedWords
            ? !version.trainedWords.length
            : false
          : true,
        earlyAccessTimeFrame:
          version.earlyAccessTimeFrame && features.earlyAccessModel
            ? String(version.earlyAccessTimeFrame)
            : '0',
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acceptsTrainedWords, isTextualInversion, model?.id, version]);

  const atEarlyAccess = isEarlyAccess({
    publishedAt: model?.publishedAt ?? new Date(),
    earlyAccessTimeframe: version?.earlyAccessTimeFrame ?? 0,
    versionCreatedAt: version?.createdAt ?? new Date(),
  });
  const showEarlyAccessInput = version?.status !== 'Published' || atEarlyAccess;

  return (
    <>
      <Form form={form} onSubmit={handleSubmit}>
        <Stack>
          <InputText
            name="name"
            label={t("Name")}
            placeholder="e.g.: v1.0"
            withAsterisk
            maxLength={25}
          />
          {/* {showEarlyAccessInput && (
            <Input.Wrapper
              label={t("Early Access")}
              description={
                <DismissibleAlert
                  id="ea-info"
                  size="sm"
                  title={t('Get feedback on your model before full release')}
                  content={
                    <>
                      抢先体验”功能将只对
                      <Text component={NextLink} href="/pricing" variant="link" target="_blank">
                        Miko会员
                      </Text>
                      提前展示您的模型。
                    </>
                  }
                  mb="xs"
                />
              }
              error={form.formState.errors.earlyAccessTimeFrame?.message}
            >
              <InputSegmentedControl
                name="earlyAccessTimeFrame"
                data={[
                  { label: 'None', value: '0' },
                  { label: '1 day', value: '1' },
                  { label: '2 days', value: '2' },
                  { label: '3 days', value: '3' },
                  { label: '4 days', value: '4' },
                  { label: '5 days', value: '5' },
                ]}
                color="blue"
                size="xs"
                styles={(theme) => ({
                  root: {
                    border: `1px solid ${
                      theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[4]
                    }`,
                    background: 'none',
                    marginTop: theme.spacing.xs * 0.5, // 5px
                  },
                })}
                fullWidth
              />
            </Input.Wrapper>
          )} */}
          <InputSelect
            name="baseModel"
            label={t("Base Model")}
            placeholder="Base Model"
            withAsterisk
            style={{ flex: 1 }}
            data={constants.baseModels.map((x) => ({ value: x, label: x }))}
          />
          <InputRTE
            key="description"
            name="description"
            label={t('Version changes or notes')}
            description={t('Tell us about this version')}
            includeControls={['formatting', 'list', 'link']}
            editorSize="xl"
          />
          {acceptsTrainedWords && (
            <Stack spacing="xs">
              {!skipTrainedWords && (
                <InputMultiSelect
                  name="trainedWords"
                  label={t("Trigger Words")}
                  placeholder={t('e.g.: Master Chief')as string}
                  description={
                    <>
                      {t('Please input the words you have trained your model with')}{' '}
                      <span>
                        {isTextualInversion ? ' (max 1 word)' : ''}
                      </span>
                    </>
                  }
                  data={trainedWords}
                  getCreateLabel={(query) => `+ Create ${query}`}
                  maxSelectedValues={isTextualInversion ? 1 : undefined}
                  creatable
                  clearable
                  searchable
                  required
                />
              )}
              {!isTextualInversion && (
                <InputSwitch
                  name="skipTrainedWords"
                  label={t("This version doesn't require any trigger words")}
                  onChange={(e) =>
                    e.target.checked ? form.setValue('trainedWords', []) : undefined
                  }
                />
              )}
            </Stack>
          )}
          <Group spacing="xs" grow noWrap>
            <InputNumber
              name="epochs"
              label={t('Training Epochs')}
              placeholder={t('Training Epochs')as string}
              min={0}
              max={100000}
            />
            <InputNumber
              name="steps"
              label={t('Training Steps')}
              placeholder={t('Training Steps')as string}
              min={0}
              step={500}
            />
          </Group>
        </Stack>
        {children({ loading: upsertVersionMutation.isLoading })}
      </Form>
    </>
  );
}

type Props = {
  onSubmit: (version?: ModelVersionUpsertInput) => void;
  children: (data: { loading: boolean }) => React.ReactNode;
  model?: Partial<ModelUpsertInput & { publishedAt: Date | null }>;
  version?: Partial<ModelVersionUpsertInput & { createdAt: Date | null }>;
};
