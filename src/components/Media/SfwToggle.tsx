import { Popover, Stack, Group, ThemeIcon, Button, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { NextLink } from '@mantine/next';
import { IconLock } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import React from 'react';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { useSfwContext } from './sfwContext';
import { useSfwStore } from './sfwStore';
import { useTranslation } from 'react-i18next';

export function SfwToggle({ children }: { children: React.ReactElement }) {
  const { t } = useTranslation();
  const { nsfw, type, id } = useSfwContext();
  const user = useCurrentUser();
  const [opened, { close, open }] = useDisclosure(false);
  const isAuthenticated = !!user;
  const router = useRouter();

  const toggleShow = useSfwStore(
    (state) => state[type === 'model' ? 'toggleModel' : 'toggleReview']
  );

  const child = nsfw
    ? React.cloneElement(children, {
        onClick: (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
          e.stopPropagation();
          e.preventDefault();
          e.nativeEvent.stopImmediatePropagation();
          if (isAuthenticated) toggleShow(id);
          else opened ? close() : open();
        },
      })
    : children;

  const popover = (
    <Popover
      width={300}
      position="bottom"
      opened={opened}
      withArrow
      closeOnClickOutside
      withinPortal
    >
      <Popover.Target>{child}</Popover.Target>
      <Popover.Dropdown>
        <Stack spacing="xs">
          <Group>
            <ThemeIcon color="red" size="xl" variant="outline">
              <IconLock />
            </ThemeIcon>
            <Text size="sm" weight={500} sx={{ flex: 1 }}>
              {t('You must be logged in to view this content')}
            </Text>
          </Group>

          <Button size="xs" component={NextLink} href={`/login?returnUrl=${router.asPath}`}>
            {t('Login')}
          </Button>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );

  return !isAuthenticated && nsfw ? popover : child;
}
