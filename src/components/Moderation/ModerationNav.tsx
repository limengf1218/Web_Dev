import { useTranslation } from 'react-i18next';
import { ActionIcon, Menu } from '@mantine/core';
import { NextLink } from '@mantine/next';
import { IconBadge } from '@tabler/icons-react';
import { useMemo } from 'react';

export function ModerationNav() {
const { t } = useTranslation();
  const menuItems = useMemo(
    () =>
      [
        { label: t('Reports'), href: '/moderator/reports' },
        { label: 'Images', href: '/moderator/images' },
        { label: t('Image Tags'), href: '/moderator/image-tags' },
        { label: 'Models', href: '/moderator/models' },
      ].map((link) => (
        <Menu.Item key={link.href} component={NextLink} href={link.href}>
          {link.label}
        </Menu.Item>
      )),
    []
  );

  return (
    <Menu>
      <Menu.Target>
        <ActionIcon color="yellow" variant="transparent">
          <IconBadge />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>{menuItems}</Menu.Dropdown>
    </Menu>
  );
}
