/* eslint-disable prettier/prettier */
import { useTranslation } from "react-i18next";
import {
  ActionIcon,
  AspectRatio,
  Box,
  Card,
  Center,
  Chip,
  Container,
  Group,
  Loader,
  Menu,
  Rating,
  SegmentedControl,
  SegmentedControlItem,
  SegmentedControlProps,
  Stack,
  Tabs,
  Text,
  Title,
  createStyles,
  TextInput,
  Button,
  Modal,
  Alert,
  Tooltip
} from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { NextLink } from "@mantine/next";
import { MetricTimeframe, ReviewReactions } from "@prisma/client";
import {
  IconAlbum,
  IconArrowBackUp,
  IconBan,
  IconBox,
  IconDotsVertical,
  IconDownload,
  IconHeart,
  IconMicrophone,
  IconMicrophoneOff,
  IconNotebook,
  IconPhoto,
  IconStar,
  IconTrash,
  IconUpload,
  IconUsers,
  IconEdit,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getEdgeUrl } from "~/client-utils/cf-images-utils";
import { AppLayout } from "~/components/AppLayout/AppLayout";
import { NotFound } from "~/components/AppLayout/NotFound";
import { CivitaiTabs } from "~/components/CivitaiWrapped/CivitaiTabs";
import { DomainIcon } from "~/components/DomainIcon/DomainIcon";
import { EdgeImage } from "~/components/EdgeImage/EdgeImage";
import { PeriodFilter, SortFilter } from "~/components/Filters";
import { FollowUserButton } from "~/components/FollowUserButton/FollowUserButton";
import { IconBadge } from "~/components/IconBadge/IconBadge";
import ImagesInfinite from "~/components/Image/Infinite/ImagesInfinite";
import { useImageQueryParams } from "~/components/Image/image.utils";
import { RankBadge } from "~/components/Leaderboard/RankBadge";
import { MasonryContainer } from "~/components/MasonryColumns/MasonryContainer";
import { MasonryProvider } from "~/components/MasonryColumns/MasonryProvider";
import { Meta } from "~/components/Meta/Meta";
import { TrackView } from "~/components/TrackView/TrackView";
import { Username } from "~/components/User/Username";
import { useCurrentUser } from "~/hooks/useCurrentUser";
import { useFeatureFlags } from "~/providers/FeatureFlagsProvider";
import { constants } from "~/server/common/constants";
import { ImageSort } from "~/server/common/enums";
import { userPageQuerySchema } from "~/server/schema/user.schema";
import { createServerSideProps } from "~/server/utils/server-side-helpers";
import { sortDomainLinks } from "~/utils/domain-link";
import { showErrorNotification } from "~/utils/notifications";
import { abbreviateNumber } from "~/utils/number-helpers";
import { removeEmpty } from "~/utils/object-helpers";
import { invalidateModeratedContent } from "~/utils/query-invalidation-utils";
import { postgresSlugify } from "~/utils/string-helpers";
import { trpc } from "~/utils/trpc";
import { showSuccessNotification } from "~/utils/notifications";

export const getServerSideProps = createServerSideProps({
  useSSG: true,
  resolver: async ({ ssg, ctx }) => {
    const { username, id } = userPageQuerySchema.parse(ctx.params);
    if (id || username) await ssg?.user.getCreator.prefetch({ username });

    return {
      props: removeEmpty({
        id,
        username,
      }),
    };
  },
});
const segments = [
  { label: "我的图片", value: "images" },
  { label: "我的反馈", value: "reactions" },
] as const;
type Segment = (typeof segments)[number]["value"];

const availableReactions = Object.keys(
  constants.availableReactions
) as ReviewReactions[];

const useChipStyles = createStyles((theme) => ({
  label: {
    fontSize: 12,
    fontWeight: 500,
    padding: `0 ${theme.spacing.xs * 0.75}px`,

    '&[data-variant="filled"]': {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[8]
          : theme.colors.gray[1],

      "&[data-checked]": {
        backgroundColor:
          theme.colorScheme === "dark"
            ? theme.fn.rgba(theme.colors.blue[theme.fn.primaryShade()], 0.5)
            : theme.fn.rgba(theme.colors.blue[theme.fn.primaryShade()], 0.2),
      },
    },

    [theme.fn.smallerThan("xs")]: {
      padding: `4px ${theme.spacing.sm}px !important`,
      fontSize: 18,
      height: "auto",

      "&[data-checked]": {
        padding: `4px ${theme.spacing.sm}px`,
      },
    },
  },

  iconWrapper: {
    display: "none",
  },

  chipGroup: {
    [theme.fn.smallerThan("xs")]: {
      width: "100%",
    },
  },
}));

export function UserImagesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentUser = useCurrentUser() as any;
  const { classes } = useChipStyles();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {
    replace,
    query: {
      period = MetricTimeframe.AllTime,
      sort = ImageSort.Newest,
      username = "",
      reactions,
      ...query
    },
  } = useImageQueryParams();

  const isSameUser =
    !!currentUser &&
    postgresSlugify(currentUser.username) === postgresSlugify(username);
  const section = isSameUser ? query.section ?? "images" : "images";

  const viewingReactions = section === "reactions";

  // currently not showing any content if the username is undefined
  if (!username) return <NotFound />;

  return (
    <Tabs.Panel value="/images">
      <MasonryProvider
        columnWidth={constants.cardSizes.image}
        maxColumnCount={7}
        maxSingleColumnWidth={450}
      >
        <MasonryContainer fluid>
          <Stack spacing="xs">
            <Group spacing={8}>
              {isSameUser && (
                <ContentToggle
                  size="xs"
                  value={section}
                  onChange={(section) => replace({ section })}
                />
              )}
              {viewingReactions && (
                <Chip.Group
                  spacing={4}
                  value={reactions ?? []}
                  onChange={(reactions: ReviewReactions[]) =>
                    replace({ reactions })
                  }
                  className={classes.chipGroup}
                  multiple
                  noWrap
                >
                  {availableReactions.map((reaction, index) => (
                    <Chip
                      key={index}
                      value={reaction}
                      classNames={classes}
                      variant="filled"
                      radius="sm"
                      size="xs"
                    >
                      {
                        constants.availableReactions[
                        reaction as ReviewReactions
                        ]
                      }
                    </Chip>
                  ))}
                </Chip.Group>
              )}
              <SortFilter
                type="images"
                value={sort}
                onChange={(x) => replace({ sort: x as ImageSort })}
              />
              <Box ml="auto">
                <PeriodFilter
                  type="images"
                  value={period}
                  onChange={(x) => replace({ period: x })}
                />
              </Box>
            </Group>
            <ImagesInfinite
              filters={{
                ...query,
                period,
                sort,
                reactions: viewingReactions
                  ? reactions ?? availableReactions
                  : undefined,
                username: viewingReactions ? undefined : username,
              }}
              withTags={
                !viewingReactions && (currentUser?.isModerator || isSameUser)
              }
            />
          </Stack>
        </MasonryContainer>
      </MasonryProvider>
    </Tabs.Panel>
  );
}

function ContentToggle({
  value,
  onChange,
  ...props
}: Omit<SegmentedControlProps, "value" | "onChange" | "data"> & {
  value: Segment;
  onChange: (value: Segment) => void;
}) {
  return (
    <SegmentedControl
      {...props}
      value={value}
      onChange={onChange}
      data={segments as unknown as SegmentedControlItem[]}
      sx={(theme) => ({
        [theme.fn.smallerThan("sm")]: {
          width: "100%",
        },
      })}
    />
  );
}

function NestedLayout({ children }: { children: React.ReactNode }) {
  const [editEmailOpen, setEditEmailOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [submitReady, setSubmitReady] = useState(false);

  const { t } = useTranslation();
  const router = useRouter();
  const { username } = router.query as { username: string };
  const currentUser = useCurrentUser();
  const { classes, theme } = useStyles();
  const queryUtils = trpc.useContext();
  const features = useFeatureFlags();

  const { mutate, isLoading, error } = trpc.user.update.useMutation({
    async onSuccess(user) {
      showSuccessNotification({ message: t("Your profile has been saved") });
      await queryUtils.review.getAll.invalidate();
      await queryUtils.comment.getAll.invalidate();

      if (user) {
        setEditEmailOpen(false);
      }
    },
  });

  const { data: user, isLoading: userLoading } = trpc.user.getCreator.useQuery({
    username,
  });

  const { models: uploads } = user?._count ?? { models: 0 };
  const stats = user?.stats;
  const isMod = currentUser && currentUser.isModerator;
  const isSameUser =
    !!currentUser &&
    postgresSlugify(currentUser.username) === postgresSlugify(username);

  const removeContentMutation = trpc.user.removeAllContent.useMutation({
    onSuccess() {
      invalidateModeratedContent(queryUtils);
    },
  });
  const toggleMuteMutation = trpc.user.toggleMute.useMutation({
    async onMutate() {
      await queryUtils.user.getCreator.cancel({ username });

      const prevUser = queryUtils.user.getCreator.getData({ username });
      queryUtils.user.getCreator.setData({ username }, () =>
        prevUser
          ? {
            ...prevUser,
            muted: !prevUser.muted,
          }
          : undefined
      );

      return { prevUser };
    },
    onError(_error, _vars, context) {
      queryUtils.user.getCreator.setData({ username }, context?.prevUser);
      showErrorNotification({
        error: new Error(t("Unable to mute user, please try again.") as string),
      });
    },
  });
  const handleToggleMute = () => {
    if (user) toggleMuteMutation.mutate({ id: user.id });
  };
  const toggleBanMutation = trpc.user.toggleBan.useMutation({
    async onMutate() {
      await queryUtils.user.getCreator.cancel({ username });

      const prevUser = queryUtils.user.getCreator.getData({ username });
      queryUtils.user.getCreator.setData({ username }, () =>
        prevUser
          ? {
            ...prevUser,
            bannedAt: prevUser.bannedAt ? null : new Date(),
          }
          : undefined
      );

      return { prevUser };
    },
    onError(_error, _vars, context) {
      queryUtils.user.getCreator.setData({ username }, context?.prevUser);
      showErrorNotification({
        error: new Error(t("Unable to ban user, please try again.") as string),
      });
    },
  });
  const handleToggleBan = () => {
    if (user) {
      if (user.bannedAt) toggleBanMutation.mutate({ id: user.id });
      else
        openConfirmModal({
          title: t("Ban User"),
          children: t(
            `Are you sure you want to ban this user? Once a user is banned, they won't be able to access the app again.`
          ),
          labels: { confirm: t("Yes, ban the user"), cancel: t("Cancel") },
          confirmProps: { color: "red" },
          onConfirm: () => toggleBanMutation.mutate({ id: user.id }),
        });
    }
  };
  const handleRemoveContent = () => {
    if (!user) return;
    openConfirmModal({
      title: t("Remove All Content"),
      children: t(
        `Are you sure you want to remove all content (models, reviews, comments, posts, and images) by this user? This action cannot be undone.`
      ),
      labels: { confirm: t("Yes, remove all content"), cancel: t("Cancel") },
      confirmProps: { color: "red" },
      onConfirm: () => removeContentMutation.mutate({ id: user.id }),
    });
  };

  // Redirect all users to the creator's models tab if they have uploaded models
  useEffect(() => {
    if (router.pathname !== "/user/[username]") return;
    if (uploads > 0) router.replace(`/user/${username}/models`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploads, username]);

  useEffect(() => {
    if (user && user.email) setEmail(user.email);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClaim = (username: string | null) => {
    if (username) router.push(`/claim?username=${username}`)
  }

  if (userLoading && !user)
    return (
      <Container>
        <Center p="xl">
          <Loader size="lg" />
        </Center>
      </Container>
    );
  if (!userLoading && !user) return <NotFound />;

  const activeTab =
    router.pathname.split("/[username]").pop()?.split("?").at(0) || "/images";

  return (
    <>
      {user && stats ? (
        <Meta
          title={`${user.username} Creator Profile | mikomiko`}
          description={`Average Rating: ${stats.ratingAllTime.toFixed(
            1
          )} (${abbreviateNumber(
            stats.ratingCountAllTime
          )}), Models Uploaded: ${abbreviateNumber(
            uploads
          )}, Followers: ${abbreviateNumber(
            stats.followerCountAllTime
          )}, Total Likes Received: ${abbreviateNumber(
            stats.favoriteCountAllTime
          )}, Total Downloads Received: ${abbreviateNumber(
            stats.downloadCountAllTime
          )}. `}
          image={
            !user.image ? undefined : getEdgeUrl(user.image, { width: 1200 })
          }
        />
      ) : (
        <Meta
          title={`Creator Profile | mikomiko`}
          description={
            t("Learn more about this awesome creator on mikomiko.") as string
          }
        />
      )}
      {user && (
        <TrackView entityId={user.id} entityType="User" type="ProfileView" />
      )}
      <CivitaiTabs
        value={activeTab}
        onTabChange={(value) => router.push(`/user/${username}${value}`)}
      >
        {user && (
          <>
            <Box className={classes.banner} mb="md">
              <Container size="xl">
                <Stack className={classes.wrapper} spacing="md" align="center">
                  {user.image && (
                    <div className={classes.outsideImage}>
                      <AspectRatio ratio={1 / 1} className={classes.image}>
                        <EdgeImage
                          src={user.image}
                          name={user.username}
                          width={128}
                          alt={user.username ?? ""}
                        />
                      </AspectRatio>
                    </div>
                  )}
                  <Card
                    radius="sm"
                    className={classes.card}
                    withBorder
                    shadow="sm"
                  >
                    <Group noWrap>
                      {user.image && (
                        <div className={classes.insideImage}>
                          <AspectRatio ratio={1 / 1} className={classes.image}>
                            <EdgeImage
                              src={user.image}
                              name={user.username}
                              width={128}
                              alt={user.username ?? ""}
                            />
                          </AspectRatio>
                        </div>
                      )}
                      <Stack spacing="xs">
                        <Group position="apart">
                          <Title order={2}>
                            <Username {...user} inherit />
                          </Title>
                          <Group spacing={4} noWrap>
                            <FollowUserButton
                              userId={user.id}
                              size="md"
                              compact
                            />

                            <Modal
                              opened={editEmailOpen}
                              onClose={() => setEditEmailOpen(false)}
                              title={t('Edit User Email')}
                            >
                              {error && (
                                <Alert color="red" variant="light">
                                  {error.data?.code === 'CONFLICT' ? t('That email is already taken') : error.message}
                                </Alert>
                              )}
                              <TextInput
                                name="email"
                                placeholder={user.email ?? "user@email.com"}
                                value={email}
                                onChange={(e) => {
                                  setEmail(e.target.value);
                                  if (/\S+@\S+\.\S+/.test(e.target.value)) {
                                    setEmailError(false);
                                    if (e.target.value != user.email)
                                      setSubmitReady(true);
                                    else setSubmitReady(false);
                                  } else {
                                    setEmailError(true);
                                    setSubmitReady(false);
                                  }
                                }}
                                error={emailError ? t("Invalid email") : ""}
                                mt="md"
                              />
                              <Button
                                fullWidth
                                loading={isLoading}
                                disabled={emailError || !submitReady}
                                onClick={() => {
                                  const id = user.id;
                                  mutate({ id, email });
                                }}
                                mt="md"
                              >
                                {t("Submit")}
                              </Button>
                            </Modal>

                            {(isMod || isSameUser) && (
                              <Menu position="left" withinPortal>
                                <Menu.Target>
                                  <ActionIcon
                                    loading={removeContentMutation.isLoading}
                                  >
                                    <IconDotsVertical />
                                  </ActionIcon>
                                </Menu.Target>
                                <Menu.Dropdown>
                                  <>
                                    {isMod && (
                                      <>
                                        <Menu.Item
                                          icon={
                                            <IconEdit size={14} stroke={1.5} />
                                          }
                                          onClick={() => {
                                            setEditEmailOpen(true);
                                          }}
                                        >
                                          {t("Edit User Email")}
                                        </Menu.Item>

                                        <Menu.Item
                                          color={
                                            user.bannedAt ? "green" : "red"
                                          }
                                          icon={
                                            !user.bannedAt ? (
                                              <IconBan size={14} stroke={1.5} />
                                            ) : (
                                              <IconArrowBackUp
                                                size={14}
                                                stroke={1.5}
                                              />
                                            )
                                          }
                                          onClick={handleToggleBan}
                                        >
                                          {user.bannedAt
                                            ? t("Restore user")
                                            : t("Ban user")}
                                        </Menu.Item>
                                        <Menu.Item
                                          color="red"
                                          icon={
                                            <IconTrash size={14} stroke={1.5} />
                                          }
                                          onClick={handleRemoveContent}
                                        >
                                          {t("Remove all content")}
                                        </Menu.Item>
                                        <Menu.Item
                                          icon={
                                            user.muted ? (
                                              <IconMicrophone
                                                size={14}
                                                stroke={1.5}
                                              />
                                            ) : (
                                              <IconMicrophoneOff
                                                size={14}
                                                stroke={1.5}
                                              />
                                            )
                                          }
                                          onClick={handleToggleMute}
                                        >
                                          {user.muted
                                            ? t("Unmute user")
                                            : t("Mute user")}
                                        </Menu.Item>
                                      </>
                                    )}
                                    {isSameUser && (
                                      <Menu.Item
                                        component={NextLink}
                                        href={`/user/${user.username}/manage-categories`}
                                      >
                                        {t("Manage model categories")}
                                      </Menu.Item>
                                    )}
                                  </>
                                </Menu.Dropdown>
                              </Menu>
                            )}
                          </Group>
                        </Group>
                        <Group spacing="xs">
                          <RankBadge rank={user.rank} size="lg" />
                          {stats && (
                            <>
                              <IconBadge
                                tooltip={t("Average Rating")}
                                sx={{ userSelect: "none" }}
                                size="lg"
                                icon={
                                  <Rating
                                    size="sm"
                                    value={stats.ratingAllTime}
                                    readOnly
                                    emptySymbol={
                                      theme.colorScheme === "dark" ? (
                                        <IconStar
                                          size={18}
                                          fill="rgba(255,255,255,.3)"
                                          color="transparent"
                                        />
                                      ) : undefined
                                    }
                                  />
                                }
                                variant={
                                  theme.colorScheme === "dark" &&
                                    stats.ratingCountAllTime > 0
                                    ? "filled"
                                    : "light"
                                }
                              >
                                <Text
                                  size="sm"
                                  color={
                                    stats.ratingCountAllTime > 0
                                      ? undefined
                                      : "dimmed"
                                  }
                                >
                                  {abbreviateNumber(stats.ratingCountAllTime)}
                                </Text>
                              </IconBadge>
                              <IconBadge
                                tooltip={t("Uploads")}
                                icon={<IconUpload size={16} />}
                                color="gray"
                                size="lg"
                                variant={
                                  theme.colorScheme === "dark"
                                    ? "filled"
                                    : "light"
                                }
                              >
                                <Text size="sm">
                                  {abbreviateNumber(uploads)}
                                </Text>
                              </IconBadge>
                              <IconBadge
                                tooltip={t("Followers")}
                                icon={<IconUsers size={16} />}
                                href={`/user/${user.username}/followers`}
                                color="gray"
                                size="lg"
                                variant={
                                  theme.colorScheme === "dark"
                                    ? "filled"
                                    : "light"
                                }
                              >
                                <Text size="sm">
                                  {abbreviateNumber(stats.followerCountAllTime)}
                                </Text>
                              </IconBadge>
                              <IconBadge
                                tooltip={t("Favorites")}
                                icon={<IconHeart size={16} />}
                                color="gray"
                                variant={
                                  theme.colorScheme === "dark"
                                    ? "filled"
                                    : "light"
                                }
                                size="lg"
                              >
                                <Text size="sm">
                                  {abbreviateNumber(stats.favoriteCountAllTime)}
                                </Text>
                              </IconBadge>
                              <IconBadge
                                tooltip={t("Downloads")}
                                icon={<IconDownload size={16} />}
                                variant={
                                  theme.colorScheme === "dark"
                                    ? "filled"
                                    : "light"
                                }
                                size="lg"
                              >
                                <Text size="sm">
                                  {abbreviateNumber(stats.downloadCountAllTime)}
                                </Text>
                              </IconBadge>
                            </>
                          )}
                        </Group>
                        {!!user.links?.length && (
                          <Group spacing={0}>
                            {sortDomainLinks(user.links).map((link, index) => (
                              <ActionIcon
                                key={index}
                                component="a"
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                size="md"
                              >
                                <DomainIcon domain={link.domain} size={22} />
                              </ActionIcon>
                            ))}
                          </Group>
                        )}
                        <Group position="right">
                          <Tooltip label={t("Account Claim | mikomiko")}>
                            <Button onClick={() => handleClaim(user.username)}>
                              {t("Mirrored from Civitai")}
                            </Button>
                          </Tooltip>
                        </Group>
                      </Stack>
                    </Group>
                  </Card>
                  <Tabs.List position="center">
                    <Tabs.Tab value="/images" icon={<IconPhoto size="1rem" />}>
                      {t("Images")}
                    </Tabs.Tab>
                    <Tabs.Tab value="/posts" icon={<IconAlbum size="1rem" />}>
                      {t("Posts")}
                    </Tabs.Tab>
                    <Tabs.Tab value="/models" icon={<IconBox size="1rem" />}>
                      {t("Models")}
                    </Tabs.Tab>
                    {features.articles && (
                      <Tabs.Tab
                        value="/articles"
                        icon={<IconNotebook size="1rem" />}
                      >
                        {t("Articles")}
                      </Tabs.Tab>
                    )}
                  </Tabs.List>
                </Stack>
              </Container>
            </Box>
            {children}
          </>
        )}
      </CivitaiTabs>
    </>
  );
}

const useStyles = createStyles((theme) => ({
  banner: {
    position: "relative",
    marginTop: `-${theme.spacing.md}px`,
    paddingTop: theme.spacing.xl * 2,
    paddingBottom: theme.spacing.md,
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[8]
        : theme.colors.gray[1],

    [`@media (max-width: ${theme.breakpoints.xs}px)`]: {
      paddingTop: theme.spacing.md,
    },
  },
  image: {
    width: "128px",
    borderRadius: theme.radius.sm,
    overflow: "hidden",
  },
  wrapper: {
    [`@media (max-width: ${theme.breakpoints.xs}px)`]: {
      alignItems: "center",
    },
  },
  outsideImage: {
    display: "none",
    [`@media (max-width: ${theme.breakpoints.xs}px)`]: {
      display: "block",
    },
  },
  insideImage: {
    [`@media (max-width: ${theme.breakpoints.xs}px)`]: {
      display: "none",
    },
  },
  card: {
    [`@media (max-width: ${theme.breakpoints.xs}px)`]: {
      width: "100%",
    },
  },
}));

export const UserProfileLayout = (page: React.ReactElement) => (
  <AppLayout>
    <NestedLayout>{page}</NestedLayout>
  </AppLayout>
);

UserImagesPage.getLayout = UserProfileLayout;

export default UserImagesPage;
