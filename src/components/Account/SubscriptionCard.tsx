import { useTranslation } from 'react-i18next';
import { Button, Card, Stack, Center, Loader, Title, Text, Group, Code } from '@mantine/core';
import { IconRotateClockwise, IconSettings } from '@tabler/icons-react';
import { upperFirst } from 'lodash-es';
import {
  DescriptionTable,
  Props as DescriptionTableProps,
} from '~/components/DescriptionTable/DescriptionTable';
import { ManageSubscriptionButton } from '~/components/Stripe/ManageSubscriptionButton';
import { SubscribeButton } from '~/components/Stripe/SubscribeButton';
import { trpc } from '~/utils/trpc';

export function SubscriptionCard() {
const { t } = useTranslation();
  const { data, isLoading } = trpc.stripe.getUserSubscription.useQuery();

  const details: DescriptionTableProps['items'] = [];
  if (data) {
    const { status, price, product } = data;
    const displayStatus = data.canceledAt ? 'canceled' : status;
    details.push({
      label: t('Plan'),
      value: product.name,
    });
    details.push({
      label: t('Status'),
      value: (
        <Group align="flex-end" position="apart">
          <Text>{upperFirst(displayStatus)}</Text>
          <Text size="xs" color="dimmed">
            {t('Since')} {(data.canceledAt ?? data.createdAt).toLocaleDateString()}
          </Text>
        </Group>
      ),
    });
    if (displayStatus === 'active') {
      details.push({
        label: t('Price'),
        value: (
          <Group align="flex-end" position="apart">
            <Text>
              {'$' +
                price.unitAmount / 100 +
                ' ' +
                price.currency.toUpperCase() +
                ' per ' +
                price.interval}
            </Text>
            <Text size="xs" color="dimmed">
              {t('Paid')} {data.currentPeriodStart.toLocaleDateString()}
            </Text>
          </Group>
        ),
      });
    }

    details.push({
      label: data.cancelAtPeriodEnd ? 'Ends' : 'Renews',
      value: new Date(data.currentPeriodEnd).toLocaleDateString(),
    });
  }

  return (
    <Card withBorder>
      <Stack>
        <Group position="apart">
          <Title id="manage-subscription" order={2}>
            {t('Membership')}
          </Title>
          {data?.canceledAt ? (
            <SubscribeButton priceId={data?.price.id}>
              <Button compact variant="outline" rightIcon={<IconRotateClockwise size={16} />}>
                {t('Resume')}
              </Button>
            </SubscribeButton>
          ) : (
            <ManageSubscriptionButton>
              <Button compact variant="outline" rightIcon={<IconSettings size={16} />}>
                {t('Manage')}
              </Button>
            </ManageSubscriptionButton>
          )}
        </Group>
        {isLoading ? (
          <Center p="xl">
            <Loader />
          </Center>
        ) : data ? (
          <DescriptionTable items={details} />
        ) : null}
      </Stack>
    </Card>
  );
}
