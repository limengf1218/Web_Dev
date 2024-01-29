import { useTranslation } from 'react-i18next';
import { Anchor } from '@mantine/core';
import { ModelType } from '@prisma/client';
import { IconAlertCircle } from '@tabler/icons-react';

import { AlertWithIcon } from '~/components/AlertWithIcon/AlertWithIcon';
import { createModelFileDownloadUrl } from '~/server/common/model-helpers';

export const ModelFileAlert = ({ files, modelType, versionId }: ModelFileAlertProps) => {
  let hasNegativeEmbed = false;
  let hasConfig = false;
  let hasVAE = false;
  const { t } = useTranslation();
  const isLoCon = modelType === ModelType.LoCon;
  const isWildcards = modelType === ModelType.Wildcards;
  if (files) {
    for (const file of files) {
      if (modelType === ModelType.TextualInversion && file.type === 'Negative')
        hasNegativeEmbed = true;
      else if (file.type === 'Config') hasConfig = true;
      else if (modelType === ModelType.Checkpoint && file.type === 'VAE') hasVAE = true;
    }
  }

  return (
    <>
      {isWildcards && (
        <AlertWithIcon icon={<IconAlertCircle />}>
          {t('This is a Wildcard collection, it requires an')}{' '}
          <Anchor
            href="https://github.com/AUTOMATIC1111/stable-diffusion-webui-wildcards"
            rel="nofollow"
            target="_blank"
          >
            {t('additional extension in Automatic 1111')}
          </Anchor>{' '}
          {t('to work.')}
        </AlertWithIcon>
      )}
      {isLoCon && (
        <AlertWithIcon icon={<IconAlertCircle />}>
          {t('This is a LyCORIS (LoCon/LoHA) model, and requires an')}{' '}
          <Anchor
            href="https://github.com/KohakuBlueleaf/a1111-sd-webui-lycoris"
            rel="nofollow"
            target="_blank"
          >
            {t('additional extension in Automatic 1111')}
          </Anchor>{' '}
          {t('to work.')}
        </AlertWithIcon>
      )}
      {hasNegativeEmbed && (
        <AlertWithIcon icon={<IconAlertCircle />}>
          {t('This Textual Inversion includes a')}{' '}
          <Anchor
            href={createModelFileDownloadUrl({
              versionId,
              type: 'Negative',
            })}
          >
            {t('Negative embed')}
          </Anchor>
          {t(', install the negative and use it in the negative prompt for full effect.')}
        </AlertWithIcon>
      )}
      {hasConfig && (
        <AlertWithIcon icon={<IconAlertCircle />}>
          {t('This checkpoint includes a')}{' '}
          <Anchor
            href={createModelFileDownloadUrl({
              versionId,
              type: 'Config',
            })}
          >
            {t('config file')}
          </Anchor>
          {t(', download and place it along side the checkpoint.')}
        </AlertWithIcon>
      )}
      {hasVAE && (
        <AlertWithIcon icon={<IconAlertCircle />}>
          {t('This checkpoint includes a')}{' '}
          <Anchor
            href={createModelFileDownloadUrl({
              versionId,
              type: 'VAE',
            })}
          >
            {t('VAE')}
          </Anchor>
          {t(', download and place it along side the checkpoint.')}
        </AlertWithIcon>
      )}
    </>
  );
};

type ModelFileAlertProps = {
  files: { type: string }[];
  modelType: ModelType;
  versionId: number;
};
