import { useTranslation } from 'react-i18next';
import { Card, Stack, Switch, Title, Accordion } from '@mantine/core';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { getNotificationTypesByGroup } from '~/server/notifications/utils.notifications';
import { showSuccessNotification } from '~/utils/notifications';

import { trpc } from '~/utils/trpc';

const notificationTypesByGroup = getNotificationTypesByGroup();
// const settings = Object.entries(getNotificationTypes()).map(([type, label]) => ({ type, label }));

export function NotificationsCard() {
  const { t } = useTranslation();
  const currentUser = useCurrentUser();
  const queryUtils = trpc.useContext();

  const { data: userNotificationSettings = [], isLoading } =
    trpc.user.getNotificationSettings.useQuery();
  const disabledSettings = userNotificationSettings.map((userSetting) => userSetting.type);

  const updateNotificationSettingMutation = trpc.notification.updateUserSettings.useMutation({
    async onMutate({ toggle, type, userId }) {
      await queryUtils.user.getNotificationSettings.cancel();

      const prevUserSettings = queryUtils.user.getNotificationSettings.getData() ?? [];
      const latestSetting =
        prevUserSettings.length > 0 ? prevUserSettings[prevUserSettings.length - 1] : { id: 0 };
      const newSetting = { ...latestSetting, type, userId, disabledAt: new Date() };

      queryUtils.user.getNotificationSettings.setData(undefined, (old = []) =>
        toggle ? old?.filter((setting) => setting.type !== type) : [...old, newSetting]
      );

      return { prevUserSettings };
    },
    onSuccess() {
      showSuccessNotification({ message: t('User profile updated') });
    },
    onError(_error, _variables, context) {
      queryUtils.user.getNotificationSettings.setData(undefined, context?.prevUserSettings);
    },
    async onSettled() {
      await queryUtils.user.getNotificationSettings.invalidate();
    },
  });
  const handleUpdateNotificationSetting = ({ toggle, type }: { toggle: boolean; type: string }) => {
    if (currentUser)
      updateNotificationSettingMutation.mutate({ toggle, type, userId: currentUser.id });
  };

  return (
    <Card withBorder>
      <Title id="notification-settings" order={2}>
        {t('Notifications Settings')}
      </Title>
      <br />
      <Accordion variant="contained" chevronPosition="left" defaultValue="mention">
        {Object.entries(notificationTypesByGroup).map(([group, types]) => {
          if (Object.entries(types).length !== 0)
            return (
              <Accordion.Item value={group} key={group}>
                <Accordion.Control>{t(`${group}`)}</Accordion.Control>
                <Accordion.Panel>
                  <Stack>
                    {Object.entries(types).map((type) => (
                      <Switch
                        key={type[0]}
                        label={t(type[1])}
                        checked={!disabledSettings.includes(type[0])}
                        disabled={isLoading}
                        onChange={({ target }) =>
                          handleUpdateNotificationSetting({ toggle: target.checked, type: type[0] })
                        }
                      />
                    ))}
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
            );
        })}
      </Accordion>
    </Card>
  );
}
