import React from 'react';
import { Button } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { IconArrowUp } from '@tabler/icons-react';

export function TopLogo() {
  const { t } = useTranslation();
  return (
    <Button leftIcon={<IconArrowUp size={16} />}>
      {t('Back to Top')}
    </Button>
  );
}