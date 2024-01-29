import { useTranslation } from 'react-i18next';
/* eslint-disable react-hooks/rules-of-hooks */
import { Alert, createStyles, Group, MantineColor, Stack, Sx, Text } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import useIsClient from '~/hooks/useIsClient';
import { trpc } from '~/utils/trpc';

export const Announcements = (props: AnnouncementsProps) => {
  const {t} = useTranslation();
  const isClient = useIsClient();
  const isIndex = isClient && window.location.pathname === '/';

  const dismissed: number[] = useMemo(() => {
    if (!isClient) return [];

    const dismissedIds = Object.keys(localStorage)
      .filter((key) => key.startsWith('announcement-'))
      .map((key) => Number(key.replace('announcement-', '')));

    if (dismissedIds.length === 0 && localStorage.getItem('welcomeAlert') === 'false')
      dismissedIds.push(0);

    return dismissedIds;
  }, [isClient]);

  const { data: latestAnnouncement, isFetching } = trpc.announcement.getLatest.useQuery(
    { dismissed },
    { enabled: isClient && dismissed.length > 0 }
  );

  if (!isClient) return null;
  if (!dismissed.length && isIndex) 
    return <Announcement
    id={0}
    emoji="👋"
    title={t('Welcome to mikomiko!')}
    content={'浏览、分享和评价自定义 AI 艺术模型，[了解更多...](/content/au)'}
    {...props}
  />;
  if (isFetching || !latestAnnouncement) return null;

  return <Announcement {...latestAnnouncement} {...props} />;
};

type AnnouncementsProps = {
  className?: string;
  sx?: Sx;
};


const Announcement = ({
  id,
  title,
  content,
  color = 'blue',
  emoji = '👋',
  className = '',
  sx,
}: AnnouncementProps) => {
  const { classes, cx } = useStyles({ color });
  const [dismissed, setDismissed] = useLocalStorage({
    key: `announcement-${id}`,
    defaultValue: false,
  });

  if (dismissed) return null;

  return (
    <Alert
      color={color}
      py={8}
      className={cx(className, classes.announcement)}
      onClose={() => setDismissed(true)}
      sx={sx}
      withCloseButton
    >
      <Group spacing="xs" noWrap>
        {emoji && (
          <Text size={36} p={0} sx={{ lineHeight: 1.2 }}>
            {emoji}
          </Text>
        )}
        <Stack spacing={0}>
          <Text size="md" weight={500} className={classes.title} mb={4}>
            {title}
          </Text>
          <Text size="sm" className={classes.text}>
            <ReactMarkdown allowedElements={['a']} unwrapDisallowed className="markdown-content">
              {content}
            </ReactMarkdown>
          </Text>
        </Stack>
      </Group>
    </Alert>
  );
};

type AnnouncementProps = {
  id: number;
  title: string;
  content: string;
  emoji?: string | null;
  color?: MantineColor;
  className?: string;
  sx?: Sx;
};

const useStyles = createStyles((theme, { color }: { color: MantineColor }) => ({
  announcement: {
    minWidth: 300,
    maxWidth: 600,
    top: 'calc(var(--mantine-header-height,0) + 16px)',
    position: 'sticky',
    margin: '0 auto',
    alignSelf: 'center',
    zIndex: 11,
    boxShadow: theme.shadows.md,
    border: `1px solid ${
      theme.colorScheme === 'dark' ? theme.colors[color][9] : theme.colors[color][2]
    }`,
    backgroundColor:
      theme.colorScheme === 'dark'
        ? theme.fn.darken(theme.colors[color][8], 0.5)
        : theme.colors[color][1],
    [theme.fn.smallerThan('md')]: {
      marginLeft: -5,
      marginRight: -5,
    },
  },
  title: {
    color: theme.colorScheme === 'dark' ? theme.colors[color][0] : theme.colors[color][7],
    lineHeight: 1.1,
  },
  text: {
    color: theme.colorScheme === 'dark' ? theme.colors[color][2] : theme.colors[color][9],
    lineHeight: 1.15,
    '& > div > a': {
      color: theme.colorScheme === 'dark' ? theme.colors[color][1] : theme.colors[color][8],
    },
  },
}));
