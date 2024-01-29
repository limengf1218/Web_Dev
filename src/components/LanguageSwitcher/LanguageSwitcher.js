import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, Group, UnstyledButton } from '@mantine/core';
import { IconLanguage } from '@tabler/icons-react';
import { LanguageLogo } from './LanguageLogo'
const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  return (
    <Menu position="bottom-start" withArrow opened={isOpen} transition={"pop"} onClose={() => setIsOpen(false)}>
      <Menu.Target>
        <UnstyledButton onClick={() => setIsOpen(true)}>
          <LanguageLogo />
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown onClose={() => setIsOpen(false)}>
        <Menu.Item onClick={() => changeLanguage('en')}>
          <Group align="center" spacing="xs">
            English
          </Group>
        </Menu.Item>
        <Menu.Item onClick={() => changeLanguage('zh')}>
          <Group align="center" spacing="xs">
            中文
          </Group>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default LanguageSwitcher;