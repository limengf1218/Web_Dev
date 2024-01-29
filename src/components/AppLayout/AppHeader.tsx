import { useTranslation } from 'react-i18next';
import {
  ActionIcon,
  Anchor,
  Badge,
  Box,
  Burger,
  Button,
  createStyles,
  Grid,
  Group,
  Header,
  Menu,
  Paper,
  ScrollArea,
  Switch,
  Transition,
  UnstyledButton,
  useMantineColorScheme,
} from '@mantine/core';
import { useClickOutside, useDisclosure } from '@mantine/hooks';
import { NextLink } from '@mantine/next';
import {
  IconBookmark,
  IconCircleDashed,
  IconCrown,
  IconHeart,
  IconHistory,
  IconLogout,
  IconMoonStars,
  IconPalette,
  IconPlus,
  IconInfoSquareRounded,
  IconSettings,
  IconSun,
  IconUpload,
  IconUser,
  IconUserCircle,
  IconUsers,
  IconWriting,
} from '@tabler/icons-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { CivitaiLinkPopover } from '~/components/CivitaiLink/CivitaiLinkPopover';
import LanguageSwitcher from '~/components/LanguageSwitcher/LanguageSwitcher';
import { ListSearch } from '~/components/ListSearch/ListSearch';
import { LoginRedirect } from '~/components/LoginRedirect/LoginRedirect';
import { Logo } from '~/components/Logo/Logo';
import { NotificationBell } from '~/components/Notifications/NotificationBell';
import { BlurToggle } from '~/components/Settings/BlurToggle';
import { SupportButton } from '~/components/SupportButton/SupportButton';
import { UserAvatar } from '~/components/UserAvatar/UserAvatar';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { LoginRedirectReason } from '~/utils/login-helpers';
import { UploadTracker } from '~/components/Resource/UploadTracker';
import { BrowsingModeIcon, BrowsingModeMenu } from '~/components/BrowsingMode/BrowsingMode';
import { ModerationNav } from '~/components/Moderation/ModerationNav';
import { useHomeSelection } from '~/components/HomeContentToggle/HomeContentToggle';
import { IconPhotoUp } from '@tabler/icons-react';
import { MenuItem } from '@mantine/core/lib/Menu/MenuItem/MenuItem';

const HEADER_HEIGHT = 70;

const useStyles = createStyles((theme) => ({
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
    flexWrap: 'nowrap',
    paddingLeft: theme.spacing.xs * 1.6, // 16px
    paddingRight: theme.spacing.xs * 1.6, // 16px

    [theme.fn.smallerThan('sm')]: {
      paddingLeft: theme.spacing.xs * 0.8, // 8px
      paddingRight: theme.spacing.xs * 0.8, // 8px
    },
  },

  burger: {
    display: 'flex',
    justifyContent: 'flex-end',
    [theme.fn.largerThan('md')]: {
      display: 'none',
    },
  },

  dropdown: {
    position: 'absolute',
    top: HEADER_HEIGHT,
    left: 0,
    right: 0,
    zIndex: 0,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    borderTopWidth: 0,
    overflow: 'hidden',

    [theme.fn.largerThan('md')]: {
      display: 'none',
    },
  },

  search: {
    [theme.fn.smallerThan('xs')]: {
      display: 'none',
    },
  },

  links: {
    display: 'flex',
    [theme.fn.smallerThan('md')]: {
      display: 'none',
    },
  },

  link: {
    display: 'block',
    lineHeight: 1,
    padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
    borderRadius: theme.radius.sm,
    textDecoration: 'none',
    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
    },

    [theme.fn.smallerThan('md')]: {
      borderRadius: 0,
      padding: theme.spacing.md,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
  },

  linkActive: {
    '&, &:hover': {
      backgroundColor: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).background,
      color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color,
    },
  },

  user: {
    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
    borderRadius: theme.radius.sm,
    transition: 'background-color 100ms ease',

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
    },

    [theme.fn.smallerThan('md')]: {
      display: 'none',
    },
  },

  userActive: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
  },
}));

type MenuLink = {
  label: React.ReactNode;
  href: string;
  redirectReason?: LoginRedirectReason;
  visible?: boolean;
};

export function AppHeader() {
  const { t } = useTranslation();
  const currentUser = useCurrentUser();
  const { classes, cx, theme } = useStyles();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const router = useRouter();

  const [burgerOpened, { open: openBurger, close: closeBurger }] = useDisclosure(false);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const ref = useClickOutside(() => closeBurger());
  const { url: homeUrl } = useHomeSelection();

  const isMuted = currentUser?.muted ?? false;

  const mainActions = useMemo<MenuLink[]>(
    () => [
      {
        href: '/models/create',
        visible: !isMuted,
        redirectReason: 'upload-model',
        label: (
          <Group align="center" spacing="xs">
            <IconUpload stroke={1.5} color={theme.colors.green[theme.fn.primaryShade()]} />
            {t('Upload a model')}
          </Group>
        ),
      },
      {
        href: '/posts/create',
        visible: !isMuted,
        redirectReason: 'post-images',
        label: (
          <Group align="center" spacing="xs">
            <IconPhotoUp stroke={1.5} color={theme.colors.green[theme.fn.primaryShade()]} />
            {t('Posts images')}
          </Group>
        ),
      },
      {
        href: '/articles/create',
        visible: !isMuted,
        redirectReason: 'create-article',
        label: (
          <Group align="center" spacing="xs">
            <IconWriting stroke={1.5} color={theme.colors.green[theme.fn.primaryShade()]} />
            {t('Write an article')}
          </Group>
        ),
      },
    ],
    [isMuted, theme]
  );
  const links = useMemo<MenuLink[]>(
    () => [
      {
        href: `/user/${currentUser?.username}`,
        visible: !!currentUser,
        label: (
          <Group align="center" spacing="xs">
            <IconUser stroke={1.5} color={theme.colors.blue[theme.fn.primaryShade()]} />
            {t('Your profile')}
          </Group>
        ),
      },
      {
        href: '/?favorites=true',
        visible: !!currentUser,
        label: (
          <Group align="center" spacing="xs">
            <IconHeart stroke={1.5} color={theme.colors.pink[theme.fn.primaryShade()]} />
            {t('Liked models')}
          </Group>
        ),
      },
      {
        href: '/articles?favorites=true&view=feed',
        visible: !!currentUser,
        label: (
          <Group align="center" spacing="xs">
            <IconBookmark stroke={1.5} />
            {t('Bookmarked Articles')}
          </Group>
        ),
      },
      {
        href: '/leaderboard/overall',
        label: (
          <Group align="center" spacing="xs">
            <IconCrown stroke={1.5} />
            {t('Leaderboard')}
          </Group>
        ),
      },
      {
        href: '/?hidden=true',
        visible: !!currentUser,
        label: (
          <Group align="center" spacing="xs">
            <IconCircleDashed stroke={1.5} color={theme.colors.yellow[theme.fn.primaryShade()]} />
            {t('Hidden models')}
          </Group>
        ),
      },
      {
        href: `/user/${currentUser?.username}/following`,
        visible: !!currentUser,
        label: (
          <Group align="center" spacing="xs">
            <IconUsers stroke={1.5} />
            {t('Creators you follow')}
          </Group>
        ),
      },
      {
        href: '/user/downloads',
        visible: !!currentUser,
        label: (
          <Group align="center" spacing="xs">
            <IconHistory stroke={1.5} />
            {t('Download History')}
          </Group>
        ),
      },
      {
        href: `/login?returnUrl=${router.asPath}`,
        visible: !currentUser,
        label: (
          <Group align="center" spacing="xs">
            <IconUserCircle stroke={1.5} />
            {t('Sign In/Sign up')}
          </Group>
        ),
      },
      {
        href: '/questions',
        visible: !!currentUser,
        label: (
          <Group align="center" spacing="xs">
            <IconInfoSquareRounded stroke={1.5} />
            {t('Questions')}{' '}
            <Badge color="yellow" size="xs">
              {t('Beta')}
            </Badge>
          </Group>
        ),
      },
    ],
    [currentUser, router.asPath, theme]
  );

  const burgerMenuItems = useMemo(
    () =>
      mainActions
        .concat(links)
        .filter(({ visible }) => visible !== false)
        .map((link) => {
          const item = (
            <Link key={link.href} href={link.href} passHref>
              <Anchor
                variant="text"
                className={cx(classes.link, { [classes.linkActive]: router.asPath === link.href })}
                onClick={() => closeBurger()}
              >
                {link.label}
              </Anchor>
            </Link>
          );

          return link.redirectReason ? (
            <LoginRedirect key={link.href} reason={link.redirectReason} returnUrl={link.href}>
              {item}
            </LoginRedirect>
          ) : (
            item
          );
        }),
    [classes, closeBurger, cx, links, mainActions, router.asPath]
  );
  const userMenuItems = useMemo(
    () =>
      links
        .filter(({ visible }) => visible !== false)
        .map((link) => (
          <Menu.Item key={link.href} component={NextLink} href={link.href}>
            {link.label}
          </Menu.Item>
        )),
    [links]
  );

  return (
    <Header ref={ref} height={HEADER_HEIGHT} fixed>
      <Grid className={classes.header} m={0} gutter="xs" align="center">
        <Grid.Col span="auto" pl={0}>
          <Group spacing="xs" noWrap>
            <Link href={homeUrl ?? '/'} passHref>
              <Anchor variant="text" onClick={() => closeBurger()}>
                <Logo />
              </Anchor>
            </Link>
            {!isMuted && (
              <Menu position="bottom-start" withArrow>
                <Menu.Target>
                  <ActionIcon
                    className={classes.links}
                    size="md"
                    variant="filled"
                    color="green"
                    radius="xl"
                  >
                    <IconPlus size={24} stroke={2.5} />
                  </ActionIcon>
                  {/* <Button className={classes.links} variant="filled" color="green" size="xs" pl={5}>
                    <IconPlus size={16} /> New
                  </Button> */}
                </Menu.Target>
                <Menu.Dropdown>
                  {mainActions
                    .filter(({ visible }) => visible !== false)
                    .map((link, index) => {
                      const menuItem = (
                        <Menu.Item
                          key={!link.redirectReason ? index : undefined}
                          component={NextLink}
                          href={link.href}
                        >
                          {link.label}
                        </Menu.Item>
                      );

                      return link.redirectReason ? (
                        <LoginRedirect
                          key={index}
                          reason={link.redirectReason}
                          returnUrl={link.href}
                        >
                          {menuItem}
                        </LoginRedirect>
                      ) : (
                        menuItem
                      );
                    })}
                </Menu.Dropdown>
              </Menu>
            )}
            <SupportButton />
          </Group>
        </Grid.Col>
        <Grid.Col span={6} md={5}>
          <ListSearch onSearch={() => closeBurger()} />
        </Grid.Col>
        <Grid.Col span="auto" className={classes.links} sx={{ justifyContent: 'flex-end' }}>
          <Group spacing="sm" align="center">
            <Switch
              size="md"
              checked={colorScheme === 'light'}
              onClick={() => toggleColorScheme()}
              color={theme.colorScheme === 'light' ? 'gray' : 'light'}
              onLabel={<IconSun size="1rem" stroke={2.5} color={theme.colors.yellow[4]} />}
              offLabel={<IconMoonStars size="1rem" stroke={2.5} color={theme.colors.blue[6]} />}
            />
            <LanguageSwitcher />
            {!currentUser ? (
              <Button
                component={NextLink}
                href={`/login?returnUrl=${router.asPath}`}
                variant="default"
              >
                {t('Sign In')}
              </Button>
            ) : null}

            {currentUser?.showNsfw && <BrowsingModeIcon />}
            {currentUser && <NotificationBell />}
            {currentUser?.isModerator && <ModerationNav />}
            <Menu
              width={260}
              opened={userMenuOpened}
              position="bottom-end"
              transition="pop-top-right"
              onClose={() => setUserMenuOpened(false)}
            >
              <Menu.Target>
                <UnstyledButton
                  className={cx(classes.user, { [classes.userActive]: userMenuOpened })}
                  onClick={() => setUserMenuOpened(true)}
                >
                  <UserAvatar user={currentUser} avatarProps={{ size: 'md' }} />
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  key={`/user/${currentUser?.username}`}
                  component={NextLink}
                  href={`/user/${currentUser?.username}`}
                >
                  <Group align="center" spacing="xs">
                    <IconUser stroke={1.5} color={theme.colors.blue[theme.fn.primaryShade()]} />
                    {t('Your profile')}
                  </Group>
                </Menu.Item>
                <Menu.Item key={'/?favorites=true'} component={NextLink} href={'/?favorites=true'}>
                  <Group align="center" spacing="xs">
                    <IconHeart stroke={1.5} color={theme.colors.pink[theme.fn.primaryShade()]} />
                    {t('My Liked')}
                  </Group>
                </Menu.Item>
                <Menu.Item
                  key={'/articles?favorites=true&view=feed'}
                  component={NextLink}
                  href={'/articles?favorites=true&view=feed'}
                >
                  <Group align="center" spacing="xs">
                    <IconBookmark stroke={1.5} />
                    {t('Bookmarked Articles')}
                  </Group>
                </Menu.Item>
                <Menu.Item
                  key={'/leaderboard/overall'}
                  component={NextLink}
                  href={'/leaderboard/overall'}
                >
                  <Group align="center" spacing="xs">
                    <IconCrown stroke={1.5} />
                    {t('Leaderboard')}
                  </Group>
                </Menu.Item>
                <Menu.Item key={'/?hidden=true'} component={NextLink} href={'/?hidden=true'}>
                  <Group align="center" spacing="xs">
                    <IconCircleDashed
                      stroke={1.5}
                      color={theme.colors.yellow[theme.fn.primaryShade()]}
                    />
                    {t('Hidden models')}
                  </Group>
                </Menu.Item>
                <Menu.Item
                  key={`/user/${currentUser?.username}/following`}
                  component={NextLink}
                  href={`/user/${currentUser?.username}/following`}
                >
                  <Group align="center" spacing="xs">
                    <IconUsers stroke={1.5} />
                    {t('Creators you follow')}
                  </Group>
                </Menu.Item>
                <Menu.Item key={'/user/downloads'} component={NextLink} href={'/user/downloads'}>
                  <Group align="center" spacing="xs">
                    <IconHistory stroke={1.5} />
                    {t('Download History')}
                  </Group>
                </Menu.Item>
                <Menu.Item key={'/questions'} component={NextLink} href={'/questions'}>
                  <Group align="center" spacing="xs">
                    <IconInfoSquareRounded stroke={1.5} />
                    {t('Questions')}{' '}
                    <Badge color="yellow" size="xs">
                      {t('Beta')}
                    </Badge>
                  </Group>
                </Menu.Item>
                {/* <Menu.Item key={`/login?returnUrl=${router.asPath}`} component={NextLink} href={`/login?returnUrl=${router.asPath}`}>
                  <Group align="center" spacing="xs">
                    <IconUserCircle stroke={1.5} />
                    {t('Sign In/Sign up')}
                  </Group>
                </Menu.Item> */}

                {currentUser ? (
                  <>
                    <Menu.Item
                      icon={<IconSettings stroke={1.5} />}
                      component={NextLink}
                      href="/user/account"
                    >
                      {t('Account settings')}
                    </Menu.Item>
                    <Menu.Item
                      icon={<IconLogout color={theme.colors.red[9]} stroke={1.5} />}
                      onClick={() => signOut()}
                    >
                      {t('Logout')}
                    </Menu.Item>
                  </>
                ) : null}
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Grid.Col>
        <Grid.Col span="auto" className={classes.burger}>
          <Group spacing={4} noWrap>
            {currentUser && <CivitaiLinkPopover />}
            {currentUser && <NotificationBell />}
            <Burger
              opened={burgerOpened}
              onClick={burgerOpened ? closeBurger : openBurger}
              size="sm"
            />
            <Transition transition="scale-y" duration={200} mounted={burgerOpened}>
              {(styles) => (
                <Paper
                  className={classes.dropdown}
                  withBorder
                  shadow="md"
                  style={{ ...styles, borderLeft: 0, borderRight: 0 }}
                  radius={0}
                >
                  {/* Calculate maxHeight based off total viewport height minus header + footer + static menu options inside dropdown sizes */}
                  <ScrollArea.Autosize maxHeight={'calc(100vh - 269px)'}>
                    {burgerMenuItems}
                  </ScrollArea.Autosize>
                  {currentUser && (
                    <Box px="md">
                      <BrowsingModeMenu />
                    </Box>
                  )}

                  <Group p="md" position="apart" grow>
                    <ActionIcon
                      variant="default"
                      onClick={() => toggleColorScheme()}
                      size="lg"
                      sx={(theme) => ({
                        color:
                          theme.colorScheme === 'dark'
                            ? theme.colors.yellow[theme.fn.primaryShade()]
                            : theme.colors.blue[theme.fn.primaryShade()],
                      })}
                    >
                      {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoonStars size={18} />}
                    </ActionIcon>
                    {currentUser && (
                      <>
                        {currentUser?.showNsfw && (
                          <BlurToggle iconProps={{ stroke: 1.5 }}>
                            {({ icon, toggle }) => (
                              <ActionIcon variant="default" size="lg" onClick={toggle}>
                                {icon}
                              </ActionIcon>
                            )}
                          </BlurToggle>
                        )}
                        <Link href="/user/account" passHref>
                          <ActionIcon
                            variant="default"
                            component="a"
                            size="lg"
                            onClick={closeBurger}
                          >
                            <IconSettings stroke={1.5} />
                          </ActionIcon>
                        </Link>
                        <ActionIcon variant="default" onClick={() => signOut()} size="lg">
                          <IconLogout
                            stroke={1.5}
                            color={theme.colors.red[theme.fn.primaryShade()]}
                          />
                        </ActionIcon>
                      </>
                    )}
                  </Group>
                </Paper>
              )}
            </Transition>
          </Group>
        </Grid.Col>
      </Grid>
    </Header>
  );
}
