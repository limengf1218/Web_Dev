import { useTranslation } from 'react-i18next';
import {
  Stack,
  Stepper,
  Group,
  Button,
  Text,
  List,
  Alert,
  CopyButton,
  Center,
  Loader,
  Tooltip,
  Box,
  Title,
  Divider,
  Tabs,
  Code,
  AspectRatio,
} from '@mantine/core';
import { openContextModal } from '@mantine/modals';
import {
  IconCheck,
  IconChevronRight,
  IconCirclePlus,
  IconClock,
  IconCopy,
  IconPlayerPlay,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { AlertWithIcon } from '~/components/AlertWithIcon/AlertWithIcon';
import { useCivitaiLink } from '~/components/CivitaiLink/CivitaiLinkProvider';
import { createContextModal } from '~/components/Modals/utils/createContextModal';
import { PlanBenefitList } from '~/components/Stripe/PlanBenefitList';
import { YoutubeEmbed } from '~/components/YoutubeEmbed/YoutubeEmbed';

const { openModal, Modal } = createContextModal({
  name: 'civitai-link-wizard',
  title: 'mikomiko Link Setup',
  size: 800,
  // withCloseButton: false,
  // closeOnClickOutside: false,
  Element: ({ context, props }) => {
    const { t } = useTranslation();
    const [active, setActive] = useState(0);
    const nextStep = () => setActive((current) => (current < 2 ? current + 1 : current));
    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

    const { connected, instance, createInstance } = useCivitaiLink();

    const handleCreateInstance = () => {
      nextStep();
      createInstance();
    };

    useEffect(() => {
      if (connected) {
        openContextModal({
          modal: 'civitai-link-success',
          withCloseButton: false,
          closeOnClickOutside: false,
          closeOnEscape: false,
          innerProps: {},
        });
      }
    }, [connected]);

    return (
      <Stepper active={active} onStepClick={setActive} breakpoint="sm" allowNextStepsSelect={false}>
        <Stepper.Step label={t('About mikomiko Link')} description={t('Learn what it does')}>
          <Stack mt="sm">
            <Stack spacing={4}>
              <Title order={3} sx={{ lineHeight: 1.1 }}>
                {t('About mikomiko Link')}
              </Title>
              <Text>{t(`mikomiko Link allows you to interact with your Stable Diffusion instance in realtime wherever it is from any device.`)}</Text>

              <AspectRatio ratio={16 / 9}>
                <YoutubeEmbed videoId="MaSRXvM05x4" />
              </AspectRatio>

              <Divider
                mt="lg"
                mb={5}
                label={
                  <Text weight={500} size="sm">
                    {t('Supported Activities:')}
                  </Text>
                }
              />
              <PlanBenefitList
                benefits={[
                  { content: t('Add & remove resources') },
                  {
                    content: t('Generate images (coming soon)'),
                    icon: <IconClock size={18} />,
                    iconColor: 'yellow',
                  },
                ]}
              />
              <Divider
                mt="lg"
                mb={5}
                label={
                  <Text weight={500} size="sm">
                    {t('Supported Stable Diffusion UIs:')}
                  </Text>
                }
              />
              <PlanBenefitList
                benefits={[
                  {
                    content: (
                      <Text
                        component="a"
                        variant="link"
                        href="https://github.com/AUTOMATIC1111/stable-diffusion-webui"
                        target="_blank"
                      >
                        {t('Automatic 1111 SD Web UI')}
                      </Text>
                    ),
                  },
                  {
                    content: (
                      <Text
                        component="a"
                        variant="link"
                        href="/github/wiki/Civitai-Link-Integration"
                        target="_blank"
                      >
                        {t('Integrate your favorite UI...')}
                      </Text>
                    ),
                    icon: <IconCirclePlus size={18} />,
                    iconColor: 'yellow',
                  },
                ]}
              />
            </Stack>
            <Group position="apart" mt="xl">
              <Button variant="default" onClick={context.close}>
                {t('Eh, nevermind...')}
              </Button>
              <Button onClick={nextStep} rightIcon={<IconChevronRight />}>{t(`Let's do it!`)}</Button>
            </Group>
          </Stack>
        </Stepper.Step>
        <Stepper.Step label={t('Prepare SD')} description={t('Add the extension')}>
          <Stack mt="sm">
            <Stack spacing={4}>
              <Title order={3} mb={0} sx={{ lineHeight: 1 }}>
                {t('Prepare Stable Diffusion for mikomiko Link')}
              </Title>
              <Text mb="md" color="dimmed">
                {t('Select your Stable Diffusion UI below for installation instructions')}
              </Text>
              <Tabs variant="outline" defaultValue="automatic">
                <Tabs.List>
                  <Tabs.Tab value="automatic">{t('Automatic 1111')}</Tabs.Tab>
                  <Tabs.Tab value="other">{t('Other')}</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="automatic" pt="md">
                  <AlertWithIcon
                    py={5}
                    mb="xs"
                    size="sm"
                    title={t('Prefer video instructions?')}
                    icon={<IconPlayerPlay />}
                    iconSize="lg"
                  >
                    {t(`We've got you covered! Check out`)}
                    <Text
                      component="a"
                      variant="link"
                      href="https://youtu.be/fs-Zs-fvxb0"
                      target="_blank"
                    >
                      {t('our video guide')}
                    </Text>
                    .
                  </AlertWithIcon>

                  <List type="ordered">
                    <List.Item>{t('Ensure Automatic 1111 is up to date')}</List.Item>
                    <List.Item>{t('Start Automatic 1111 Stable Diffusion Web UI')}</List.Item>
                    <List.Item>
                      {t('Open the')}{' '}
                      <Text component="span" td="underline">
                        {t('Extensions')}
                      </Text>{' '}
                      {t('tab')}
                    </List.Item>
                    <List.Item>
                      {t('In the')}{' '}
                      <Text component="span" td="underline">
                        {t('Extensions')}
                      </Text>{' '}
                      {t('tab, open the')}{' '}
                      <Text component="span" td="underline">
                        {t('Install From URL')}
                      </Text>{' '}
                      {t('tab')}
                    </List.Item>
                    <List.Item>
                      {t('Paste the following URL into the')}{' '}
                      <Text td="underline" component="span">
                        {t('URL')}
                      </Text>{' '}
                      {t('field:')}{' '}
                      {/* <CopyButton value="https://github.com/civitai/sd_civitai_extension">
                        {({ copied, copy }) => (
                          <Code
                            py={4}
                            sx={{ cursor: 'pointer' }}
                            block
                            onClick={() => copy()}
                            color={copied ? 'teal' : undefined}
                          >
                            <Group>
                              https://github.com/civitai/sd_civitai_extension
                              {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                            </Group>
                          </Code>
                        )}
                      </CopyButton> */}
                    </List.Item>
                    <List.Item>
                      {t('Press the')}{' '}
                      <Text component="span" td="underline">
                        {t('Install')}
                      </Text>{' '}
                      {t('button')}
                    </List.Item>
                    <List.Item>{t('After installation, restart* the Stable Diffusion Web UI')}</List.Item>
                  </List>
                  <Text color="dimmed" size="xs">
                    {t('*Be sure to restart so that the installation script can run.')}
                  </Text>
                </Tabs.Panel>
                <Tabs.Panel value="other" pt="md">
                  <Text>
                    {t(`Don't see your preferred Stable Diffusion UI or service on this list? Contact the developer and ask them to`)}
                    <Text
                      component="a"
                      variant="link"
                      href="/github/wiki/Civitai-Link-Integration"
                      target="_blank"
                    >
                      {t('Integrate mikomiko Link')}
                    </Text>
                    .
                  </Text>
                </Tabs.Panel>
              </Tabs>
            </Stack>
            <Group position="apart" mt="xl">
              <Button variant="default" onClick={prevStep}>
                {t('Go Back')}
              </Button>
              <Button
                onClick={handleCreateInstance}
                rightIcon={<IconChevronRight />}
              >{t(`Ok, it's installed`)}</Button>
            </Group>
          </Stack>
        </Stepper.Step>
        <Stepper.Step label={t('Connect SD')} description={t('Link your account')}>
          <Stack mt="sm">
            <Stack spacing={4}>
              <Title order={3} mb={0} sx={{ lineHeight: 1 }}>
                {t('Link your account')}
              </Title>
              <Text mb="md" color="dimmed">
                {t('Time to connect your Stable Diffusion instance to your Civitai Account.')}
              </Text>
              <List type="ordered">
                <List.Item>
                  {t('In your')}{' '}
                  <Text td="underline" component="span">
                    {t('SD Settings')}
                  </Text>
                  {t(', open the')}{' '}
                  <Text td="underline" component="span">
                    mikomiko
                  </Text>{' '}
                  {t('tab')}
                </List.Item>
                <List.Item>
                  {t('Paste the Link Key below into the')}{' '}
                  <Text td="underline" component="span">
                    {t('Link Key')}
                  </Text>{' '}
                  {t('field')}
                </List.Item>
                <List.Item>
                  <Text td="underline" component="span">
                    {t('Save')}
                  </Text>{' '}
                  {t('your settings')}
                </List.Item>
              </List>
              <Stack align="center" spacing={5} my="lg">
                <Title order={4}>{t('Link Key')}</Title>
                {instance?.key ? (
                  <CopyButton value={instance.key}>
                    {({ copied, copy }) => (
                      <Tooltip label="copy">
                        <Button
                          variant="default"
                          onClick={copy}
                          size="lg"
                          px="sm"
                          rightIcon={copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                        >
                          {!copied ? instance.key : 'Copied'}
                        </Button>
                      </Tooltip>
                    )}
                  </CopyButton>
                ) : (
                  <Button variant="default" size="lg" px="sm">
                    <Group spacing="xs" align="center">
                      <Loader size="sm" />
                      <span>{t('Generating key')}</span>
                    </Group>
                  </Button>
                )}
              </Stack>
            </Stack>
            <Group position="apart" mt="xl">
              <Button variant="default" onClick={prevStep}>
                {t('Go Back')}
              </Button>
            </Group>
          </Stack>
        </Stepper.Step>
      </Stepper>
    );
  },
});

export const openCivitaiLinkModal = openModal;
export default Modal;
