import { useTranslation } from 'react-i18next';
import {
  Button,
  Alert,
  Card,
  Center,
  Grid,
  Group,
  Input,
  Paper,
  Stack,
  Text,
  Title,
  HoverCard,
  ScrollArea,
  LoadingOverlay,
  Image,
  Box,
  Popover,
} from '@mantine/core';
import { IconInfoCircle, IconRosette } from '@tabler/icons-react';
import { useEffect } from 'react';
import { z } from 'zod';

import { UserAvatar } from '~/components/UserAvatar/UserAvatar';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { Form, InputProfileImageUpload, InputSelect, InputText, useForm } from '~/libs/form';
import { usernameSchema } from '~/server/schema/user.schema';
import { BadgeCosmetic, NamePlateCosmetic } from '~/server/selectors/cosmetic.selector';
import { UserWithCosmetics } from '~/server/selectors/user.selector';
import { formatDate } from '~/utils/date-helpers';
import { showSuccessNotification } from '~/utils/notifications';
import { trpc } from '~/utils/trpc';

const schema = z.object({
  id: z.number(),
  username: usernameSchema,
  image: z.string().nullable(),
  nameplateId: z.number().nullish(),
  badgeId: z.number().nullish(),
});

export function ProfileCard() {
  const { t } = useTranslation();
  const currentUser = useCurrentUser();
  const queryUtils = trpc.useContext();

  const { data: cosmetics, isLoading: loadingCosmetics } = trpc.user.getCosmetics.useQuery(
    undefined,
    { enabled: !!currentUser }
  );
  const { data: equippedCosmetics } = trpc.user.getCosmetics.useQuery(
    { equipped: true },
    { enabled: !!currentUser }
  );

  const { mutate, isLoading, error } = trpc.user.update.useMutation({
    async onSuccess(user, { badgeId, nameplateId }) {
      showSuccessNotification({ message: t('Your profile has been saved') });
      // await utils.model.getAll.invalidate();
      await queryUtils.review.getAll.invalidate();
      await queryUtils.comment.getAll.invalidate();
      currentUser?.refresh();

      if (user)
        form.reset({
          ...user,
          image: user.image ?? null,
          username: user.username ?? undefined,
          badgeId: badgeId ?? null,
          nameplateId: nameplateId ?? null,
        });
    },
  });

  const form = useForm({
    schema,
    mode: 'onChange',
    defaultValues: { ...currentUser },
    shouldUnregister: false,
  });

  useEffect(() => {
    if (equippedCosmetics && currentUser) {
      const { badges, nameplates } = equippedCosmetics;
      const [selectedBadge] = badges;
      const [selectedNameplate] = nameplates;

      form.reset({
        ...currentUser,
        nameplateId: selectedNameplate?.id ?? null,
        badgeId: selectedBadge?.id ?? null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equippedCosmetics]);

  const formUser = form.watch();
  const { nameplates = [], badges = [] } = cosmetics || {};
  const selectedBadge = badges.find((badge) => badge.id === formUser.badgeId);
  const selectedNameplate = nameplates.find((nameplate) => nameplate.id === formUser.nameplateId);

  return (
    <Card withBorder>
      <Form
        form={form}
        onSubmit={(data) => {
          const { id, username, nameplateId, badgeId, image } = data;
          mutate({ id, username, nameplateId, image, badgeId });
        }}
      >
        <Stack>
          <Title order={2}>{t('Profile')}</Title>
          {error && (
            <Alert color="red" variant="light">
              {error.data?.code === 'CONFLICT'
                ? t('That username is already taken')
                : error.message}
            </Alert>
          )}
          <Grid>
            {currentUser && (
              <Grid.Col span={12}>
                <ProfilePreview
                  user={{ ...formUser, createdAt: currentUser.createdAt }}
                  badge={selectedBadge}
                  nameplate={selectedNameplate}
                />
              </Grid.Col>
            )}
            <Grid.Col xs={12} md={7}>
              <InputText name="username" label={t('Username')} required />
            </Grid.Col>
            <Grid.Col xs={12} md={5}>
              <InputSelect
                name="nameplateId"
                placeholder={t('Select style') as string}
                label={
                  <Group spacing={4} noWrap>
                    <Input.Label>{t('Nameplate Style')}</Input.Label>
                    <Popover withArrow width={300} withinPortal position="top">
                      <Popover.Target>
                        <Box
                          display="inline-block"
                          sx={{ lineHeight: 0.8, cursor: 'pointer', opacity: 0.5 }}
                        >
                          <IconInfoCircle size={16} />
                        </Box>
                      </Popover.Target>
                      <Popover.Dropdown>
                        <Text weight={500} size="sm">
                          {t('Nameplates')}
                        </Text>
                        <Text size="sm">
                          {t(
                            'Nameplates change the appearance of your username. They can include special colors or effects. You can earn nameplates by being a subscriber or earning trophies on the site.'
                          )}
                        </Text>
                      </Popover.Dropdown>
                    </Popover>
                  </Group>
                }
                nothingFound={t('Your earned nameplate styles will appear here')}
                data={
                  nameplates.map((cosmetic) => ({
                    label: cosmetic.name,
                    value: cosmetic.id,
                  })) ?? []
                }
                disabled={loadingCosmetics}
                clearable
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <InputProfileImageUpload name="image" label={t('Profile Image')} />
            </Grid.Col>
            <Grid.Col span={12}>
              <Stack spacing={0}>
                <Group position="apart">
                  <Group spacing={4}>
                    <Input.Label>{t('Badge')}</Input.Label>
                    <Popover withArrow width={300} withinPortal position="top">
                      <Popover.Target>
                        <Box
                          display="inline-block"
                          sx={{ lineHeight: 0.8, cursor: 'pointer', opacity: 0.5 }}
                        >
                          <IconInfoCircle size={16} />
                        </Box>
                      </Popover.Target>
                      <Popover.Dropdown>
                        <Text weight={500} size="sm">
                          {t('Badges')}
                        </Text>
                        <Text size="sm">
                          {t(
                            'Badgesappear next your username and can even include special effects. You can earn badges by being a subscriber or earning trophies on the site.'
                          )}
                        </Text>
                      </Popover.Dropdown>
                    </Popover>
                  </Group>
                  {selectedBadge && (
                    <Button
                      color="red"
                      variant="subtle"
                      size="xs"
                      onClick={() => form.setValue('badgeId', null, { shouldDirty: true })}
                      compact
                    >
                      {t('Remove badge')}
                    </Button>
                  )}
                </Group>
                <Group spacing="xs" align="stretch" noWrap>
                  {selectedBadge?.data.url ? (
                    <Image src={selectedBadge.data.url} width={96} alt="Donate" />
                  ) : (
                    <Paper
                      withBorder
                      sx={{
                        width: 96,
                        height: 96,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconRosette style={{ opacity: 0.5 }} size={48} stroke={1.5} />
                    </Paper>
                  )}
                  <Paper
                    component={ScrollArea}
                    type="auto"
                    p="xs"
                    sx={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'stretch',
                      flex: '1 1 0 !important',
                    }}
                    withBorder
                  >
                    <LoadingOverlay visible={loadingCosmetics} />
                    {badges.length > 0 ? (
                      <Group spacing={8} noWrap>
                        {badges.map((cosmetic) => (
                          <HoverCard
                            key={cosmetic.id}
                            position="top"
                            width={300}
                            openDelay={300}
                            withArrow
                            withinPortal
                          >
                            <HoverCard.Target>
                              <Button
                                key={cosmetic.id}
                                p={4}
                                variant={selectedBadge?.id === cosmetic.id ? 'light' : 'subtle'}
                                onClick={() =>
                                  form.setValue('badgeId', cosmetic.id, { shouldDirty: true })
                                }
                                sx={{ height: 64, width: 64 }}
                              >
                                <Image src={cosmetic.data.url as string} alt="Donate" />
                              </Button>
                            </HoverCard.Target>
                            <HoverCard.Dropdown>
                              <Stack spacing={0}>
                                <Text size="sm" weight={500}>
                                  {cosmetic.name}
                                </Text>
                                {cosmetic.description && (
                                  <Text size="sm" sx={{ lineHeight: 1.2 }}>
                                    {cosmetic.description}
                                  </Text>
                                )}
                                <Text size="xs" color="dimmed" mt="xs">
                                  {`Acquired on ${formatDate(cosmetic.obtainedAt)}`}
                                </Text>
                              </Stack>
                            </HoverCard.Dropdown>
                          </HoverCard>
                        ))}
                      </Group>
                    ) : (
                      <Center sx={{ width: '100%', height: 72 }}>
                        <Text size="sm" color="dimmed">
                          {t('Your earned badges will appear here')}
                        </Text>
                      </Center>
                    )}
                  </Paper>
                </Group>
              </Stack>
            </Grid.Col>
            <Grid.Col span={12}>
              <Button
                type="submit"
                loading={isLoading}
                disabled={!form.formState.isDirty}
                fullWidth
              >
                {t('Save')}
              </Button>
            </Grid.Col>
          </Grid>
        </Stack>
      </Form>
    </Card>
  );
}

function ProfilePreview({ user, badge, nameplate }: ProfilePreviewProps) {
  const { t } = useTranslation();
  const userWithCosmetics: UserWithCosmetics = {
    ...user,
    cosmetics: [],
    deletedAt: null,
  };
  if (badge) userWithCosmetics.cosmetics.push({ cosmetic: { ...badge, type: t('Badge') } });
  if (nameplate)
    userWithCosmetics.cosmetics.push({ cosmetic: { ...nameplate, type: 'NamePlate' } });

  return (
    <Stack spacing={4}>
      <Input.Label>{t('Preview')}</Input.Label>
      <Paper p="sm" withBorder>
        <UserAvatar
          user={userWithCosmetics}
          size="md"
          subText={user.createdAt ? `${t('Member since')} ${formatDate(user.createdAt)}` : ``}
          withUsername
        />
      </Paper>
    </Stack>
  );
}

type ProfilePreviewProps = {
  user: z.infer<typeof schema> & { createdAt?: Date };
  badge?: BadgeCosmetic;
  nameplate?: NamePlateCosmetic;
};
