import { useTranslation } from 'react-i18next';
/* eslint-disable react/jsx-no-undef */
import {
  ActionIcon,
  Group,
  Popover,
  Stack,
  Text,
  Progress,
  Title,
  GroupProps,
  Paper,
  Indicator,
  createStyles,
  ScrollArea,
  Divider,
  Center,
  Button,
  Tooltip,
  StackProps,
  Alert,
  CopyButton,
  ColorSwatch,
  useMantineTheme,
  List,
  Box,
  Badge,
} from '@mantine/core';
import { NextLink } from '@mantine/next';
import {
  IconDownload,
  IconLink,
  IconPlus,
  IconTrash,
  IconX,
  IconSettings,
  IconLinkOff,
  IconCheck,
  IconCopy,
  IconAlertTriangle,
  IconNetworkOff,
  IconScreenShare,
  IconHeart,
  IconQuestionMark,
  IconVideo,
} from '@tabler/icons-react';
import { useCallback, useState } from 'react';
import { AlertWithIcon } from '~/components/AlertWithIcon/AlertWithIcon';
import {
  civitaiLinkStatusColors,
  useCivitaiLink,
  useCivitaiLinkStore,
} from '~/components/CivitaiLink/CivitaiLinkProvider';
import { CivitaiLinkSvg } from '~/components/CivitaiLink/CivitaiLinkSvg';
import { openContext } from '~/providers/CustomModalsProvider';
import { useFeatureFlags } from '~/providers/FeatureFlagsProvider';
import { formatBytes, formatSeconds } from '~/utils/number-helpers';
import { titleCase } from '~/utils/string-helpers';

export function CivitaiLinkPopover() {
  return (
    <Popover position="bottom-end" width={400}>
      <Popover.Target>
        <span>
          <LinkButton />
        </span>
      </Popover.Target>
      <Popover.Dropdown p={0}>
        <LinkDropdown />
      </Popover.Dropdown>
    </Popover>
  );
}

function AboutCivitaiLink() {
const { t } = useTranslation();
  return (
    <>
      <AlertWithIcon
        icon={<IconAlertTriangle size={16} />}
        iconColor="yellow"
        radius={0}
        size="md"
        color="yellow"
      >
        {t('This feature is currently in early access and only available to Supporters.')}
      </AlertWithIcon>
      <Stack py="sm" px="lg" spacing={4}>
        <Center p="md" pb={0}>
          <CivitaiLinkSvg />
        </Center>
        <Text my="xs">
          {t('Interact with your')}{' '}
          <Text
            component="a"
            variant="link"
            href="https://github.com/AUTOMATIC1111/stable-diffusion-webui"
            target="_blank"
          >
            {t('Automatic1111 Stable Diffusion')}
          </Text>{' '}
          {t('instance in realtime from mikomiko')}
        </Text>
      </Stack>
      <Divider />
      <Group spacing={0} grow>
        <Button
          leftIcon={<IconVideo size={18} />}
          radius={0}
          component="a"
          href="/v/civitai-link-intro"
          variant="light"
        >
          {t('Video Demo')}
        </Button>
        <Button rightIcon={<IconHeart size={18} />} radius={0} component={NextLink} href="/pricing">
          {t('Become a Supporter')}
        </Button>
      </Group>
    </>
  );
}

function LinkDropdown() {
const { t } = useTranslation();
  const [manage, setManage] = useState(false);
  const { instance, instances, status, error } = useCivitaiLink();
  const features = useFeatureFlags();
  const notAllowed = !features.civitaiLink;

  const handleManageClick = () => {
    setManage((o) => !o);
  };

  const canToggleManageInstances = !!instances?.length && status !== 'no-selected-instance';

  return (
    <Paper style={{ overflow: 'hidden' }}>
      <Stack spacing={0} p="xs">
        <Group position="apart" noWrap>
          <Group spacing="xs">
            <Title order={4} size="sm">
              {t('mikomiko Link')}
            </Title>
            <Badge size="xs" color="yellow">
              alpha
            </Badge>
          </Group>
          {canToggleManageInstances && (
            <Tooltip label={t('Manage instances')}>
              <ActionIcon onClick={handleManageClick}>
                <IconSettings size={20} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
        {!!instances?.length && (
          <Text color="dimmed" size="xs">
            {instance?.name ?? 'no instance selected'}
          </Text>
        )}
      </Stack>
      <Divider />
      {manage ? (
        <InstancesManager />
      ) : notAllowed ? (
        <AboutCivitaiLink />
      ) : (
        {
          'not-connected': <NotConnected error={error} />,
          'no-socket-connection': <LostConnection error={error} />,
          'no-instances': <GetStarted />,
          'no-selected-instance': <InstancesManager />,
          'link-pending': <GetReconnected />,
          'link-ready': <ActivityList />,
        }[status]
      )}
    </Paper>
  );
}

function NotConnected({ error }: { error?: string }) {
const { t } = useTranslation();
  return (
    <Stack p="xl" align="center" spacing={0}>
      <IconNetworkOff size={60} strokeWidth={1} />
      <Text>{t('Cannot Connect')}</Text>
      <Text
        color="dimmed"
        size="xs"
      >{t(`We're unable to connect to the mikomiko Link Coordination Server.`)}</Text>
      {error && (
        <Text color="red" size="xs">
          {error}
        </Text>
      )}
    </Stack>
  );
}

function LostConnection({ error }: { error?: string }) {
const { t } = useTranslation();
  return (
    <Stack p="xl" align="center" spacing={0}>
      <IconNetworkOff size={60} strokeWidth={1} />
      <Text>{t('Connection Lost')}</Text>
      <Text
        color="dimmed"
        size="xs"
      >{t(`We've lost connect to the mikomiko Link Coordination Server.`)}</Text>
      {error && (
        <Text color="red" size="xs">
          {error}
        </Text>
      )}
    </Stack>
  );
}

function InstancesManager() {
const { t } = useTranslation();
  const { classes } = useStyles();

  const {
    instances,
    instance: selectedInstance,
    deselectInstance,
    deleteInstance,
    selectInstance,
    status,
  } = useCivitaiLink();

  const handleAddClick = () => {
    deselectInstance();
    openContext('civitai-link-wizard', {});
  };

  const showControls = status !== 'no-socket-connection';

  return (
    <Stack spacing={0}>
      <Group position="apart" p="xs">
        <Text weight={500}>{t('Stable Diffusion Instances')}</Text>
        {showControls && (
          <Button
            compact
            size="xs"
            variant="outline"
            leftIcon={<IconPlus size={18} />}
            onClick={handleAddClick}
          >
            {t('Add Instance')}
          </Button>
        )}
      </Group>
      <ScrollArea.Autosize maxHeight={410}>
        {instances?.map((instance) => {
          const isSelected = instance.id === selectedInstance?.id;
          return (
            <Group key={instance.id} className={classes.listItem} position="apart" p="xs">
              <Text>{instance.name}</Text>
              <Group spacing="xs">
                {isSelected && <BigIndicator />}
                {showControls && (
                  <>
                    {isSelected ? (
                      <Tooltip label="disconnect" withinPortal>
                        <ActionIcon onClick={deselectInstance}>
                          <IconLinkOff size={20} />
                        </ActionIcon>
                      </Tooltip>
                    ) : (
                      <Tooltip label="connect" withinPortal>
                        <ActionIcon onClick={() => selectInstance(instance.id)}>
                          <IconLink size={20} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                    <Tooltip label="delete" withinPortal>
                      <ActionIcon color="red" onClick={() => deleteInstance(instance.id)}>
                        <IconTrash size={20} />
                      </ActionIcon>
                    </Tooltip>
                  </>
                )}
              </Group>
            </Group>
          );
        })}
      </ScrollArea.Autosize>
    </Stack>
  );
}

function BigIndicator() {
  const theme = useMantineTheme();
  const { status } = useCivitaiLink();
  const swatch = theme.fn.variant({
    variant: 'filled',
    primaryFallback: false,
    color: civitaiLinkStatusColors[status],
  });
  return swatch.background ? <ColorSwatch color={swatch.background} size={20} /> : null;
}

function GetStarted() {
const { t } = useTranslation();
  return (
    <>
      <Stack py="sm" px="lg" spacing={4}>
        <Center p="md" pb={0}>
          <CivitaiLinkSvg />
        </Center>
        <Text my="xs">
          {t('Interact with your')}{' '}
          <Text
            component="a"
            variant="link"
            href="https://github.com/AUTOMATIC1111/stable-diffusion-webui"
            target="_blank"
          >
            {t('Automatic1111 Stable Diffusion')}
          </Text>{' '}
          {t('instance in realtime from mikomiko')}
        </Text>
      </Stack>
      <Divider />
      <Stack>
        <Button
          leftIcon={<IconPlus size={18} />}
          radius={0}
          onClick={() => openContext('civitai-link-wizard', {})}
        >
          {t('Get Started')}
        </Button>
      </Stack>
    </>
  );
}

function GetReconnected() {
const { t } = useTranslation();
  const { instance, createInstance } = useCivitaiLink();
  const handleGenerateKey = () => createInstance(instance?.id ?? undefined);

  return (
    <>
      <AlertWithIcon
        iconColor="yellow"
        icon={<IconAlertTriangle />}
        radius={0}
        size="md"
        color="yellow"
      >{t(`Couldn't connect to SD instance!`)}</AlertWithIcon>
      <Stack p="sm" spacing={4}>
        {instance?.key && (
          <Stack spacing={0} align="center" mb="md">
            <Text size="md" weight={700}>
              {t('Link Key')}
            </Text>
            <CopyButton value={instance.key}>
              {({ copied, copy }) => (
                <Tooltip label={t('Copy')} withinPortal>
                  <Button
                    onClick={copy}
                    variant="default"
                    size="lg"
                    px="sm"
                    rightIcon={copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                  >
                    {!copied ? instance.key : 'Copied'}
                  </Button>
                </Tooltip>
              )}
            </CopyButton>
          </Stack>
        )}
        <Text size="md" weight={500}>
          {t('Troubleshooting')}
        </Text>
        <List type="unordered">
          <List.Item>{t('Make sure your SD instance is up and running.')}</List.Item>
          <List.Item>
            {t('If your instance is running and you are still unable to connect,')}{' '}
            <Text
              variant="link"
              display="inline"
              style={{ cursor: 'pointer' }}
              onClick={handleGenerateKey}
            >
              {t('generate a new connection key')}
            </Text>{' '}
            {t('and add it to your SD instance.')}
          </List.Item>
        </List>
      </Stack>
    </>
  );
}

function ActivityList() {
const { t } = useTranslation();
  const ids = useCivitaiLinkStore((state) => state.ids);
  const { classes } = useStyles();
  return ids.length > 0 ? (
    <ScrollArea.Autosize maxHeight={410}>
      {ids.map((id) => (
        <LinkActivity key={id} id={id} p="xs" pr="sm" className={classes.listItem} />
      ))}
    </ScrollArea.Autosize>
  ) : (
    <Center p="lg">
      <Text color="dimmed">{t('No activity for this instance')}</Text>
    </Center>
  );
}

const useStyles = createStyles((theme) => ({
  listItem: {
    '&:nth-of-type(2n + 1)': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
    },
  },
}));

function LinkButton() {
  // only show the connected indicator if there are any instances
  const { status } = useCivitaiLink();
  const activityProgress = useCivitaiLinkStore((state) => state.activityProgress);
  const color = civitaiLinkStatusColors[status];

  return (
    <Box sx={{ position: 'relative' }}>
      <ActionIcon>
        <Indicator color={color} showZero={!!color} dot={!!color}>
          <IconScreenShare />
        </Indicator>
      </ActionIcon>
      {activityProgress && activityProgress > 0 && activityProgress < 100 && (
        <Progress
          value={activityProgress}
          striped
          animate
          size="sm"
          sx={{ position: 'absolute', bottom: -3, width: '100%' }}
        />
      )}
    </Box>
  );
}

function LinkActivity({ id, ...props }: { id: string } & GroupProps) {
  const activity = useCivitaiLinkStore(useCallback((state) => state.activities[id], [id]));
  const { runCommand } = useCivitaiLink();

  const isAdd = activity.type === 'resources:add';
  const isRemove = activity.type === 'resources:remove';

  if (!isAdd && !isRemove) return null;

  const handleCancel = () => {
    runCommand({ type: 'activities:cancel', activityId: activity.id });
  };

  return (
    <Group align="center" noWrap spacing="xs" {...props}>
      {isAdd ? <IconDownload /> : <IconTrash />}
      <Stack style={{ flex: 1 }} spacing={0}>
        <Text lineClamp={1} size="md" weight={500} style={{ lineHeight: 1 }}>
          {activity.resource.modelName || (isAdd ? activity.resource.name : undefined)}
        </Text>
        {isAdd && activity.status === 'processing' ? (
          <RequestProgress
            progress={activity.progress}
            remainingTime={activity.remainingTime}
            speed={activity.speed}
            style={{ flex: 1 }}
            onCancel={handleCancel}
          />
        ) : activity.status === 'error' ? (
          <Text color="red" size="xs">
            {activity.status}: {activity.error}
          </Text>
        ) : (
          <Text color="dimmed" size="xs">
            {activity.status === 'success'
              ? isAdd
                ? 'Downloaded'
                : 'Removed'
              : titleCase(activity.status)}
          </Text>
        )}
      </Stack>
    </Group>
  );
}

function RequestProgress({
  progress,
  remainingTime,
  speed,
  onCancel,
  ...props
}: {
  progress?: number;
  remainingTime?: number;
  speed?: number;
  onCancel: () => void;
} & StackProps) {
  if (!progress && !remainingTime && !speed) return null;

  return (
    <Stack spacing={2} {...props}>
      {progress && (
        <Group spacing={4}>
          <Progress
            sx={{ width: '100%', flex: 1 }}
            size="xl"
            value={progress}
            label={`${Math.floor(progress)}%`}
            color={progress < 100 ? 'blue' : 'green'}
            striped
            animate
          />
          <ActionIcon onClick={onCancel}>
            <IconX />
          </ActionIcon>
        </Group>
      )}
      {(speed || remainingTime) && (
        <Group position="apart">
          {speed ? <Text size="xs" color="dimmed">{`${formatBytes(speed)}/s`}</Text> : <span />}
          {remainingTime ? (
            <Text size="xs" color="dimmed">{`${formatSeconds(remainingTime)} remaining`}</Text>
          ) : (
            <span />
          )}
        </Group>
      )}
    </Stack>
  );
}
