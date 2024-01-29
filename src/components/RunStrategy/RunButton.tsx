import { useTranslation } from 'react-i18next';
import { Button, ButtonProps, Tooltip } from '@mantine/core';
import { IconPlayerPlay } from '@tabler/icons-react';
import { openContext } from '~/providers/CustomModalsProvider';

export function RunButton({ modelVersionId, ...props }: { modelVersionId: number } & ButtonProps) {
const { t } = useTranslation();
  return (
    <Tooltip label={t('Run Model')} withArrow position="top">
      <Button
        onClick={() => openContext('runStrategy', { modelVersionId })}
        color="green"
        {...props}
        sx={{
          paddingLeft: 0,
          paddingRight: 0,
          width: 36,
        }}
      >
        <IconPlayerPlay />
      </Button>
    </Tooltip>
  );
}
