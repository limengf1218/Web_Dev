import { useTranslation } from 'react-i18next';
import {
  Card,
  Container,
  Title,
  Text,
  Button,
  Stack,
  Center,
  Grid,
  Tabs,
  createStyles,
} from '@mantine/core';
import { createServerSideProps } from '~/server/utils/server-side-helpers';
import { IconHeartHandshake } from '@tabler/icons-react';
import { DonateButton } from '~/components/WechatPay/DonateButton';
import { PlanBenefitList } from '~/components/Stripe/PlanBenefitList';
import Image from 'next/image';

export default function Pricing() {
  const { t } = useTranslation();
  const { classes } = useStyles();

  return (
    <>
      <Container size="sm" mb="lg">
        <Stack>
          <Title align="center" className={classes.title}>
            {t('Support Us ❤️')}
          </Title>
          <Text align="center" className={classes.introText} sx={{ lineHeight: 1.25 }}>
            {t(
              `As the leading model sharing service, we're proud to be ad-free and adding new features every week. Help us keep the community thriving by becoming a member or making a donation. Support mikomiko and get exclusive perks.`
            )}
          </Text>
        </Stack>
      </Container>
      <Container>
        <Tabs variant="outline" defaultValue="donate">
          <Tabs.List position="center">
            <Tabs.Tab value="donate" icon={<IconHeartHandshake size={20} />}>
              {t('Donate')}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="donate" pt="md">
            <Grid justify="center">
              <Grid.Col md={4} sm={6} xs={12}>
                <Card withBorder style={{ height: '100%' }}>
                  <Stack justify="space-between" style={{ height: '100%' }}>
                    <Stack spacing={0} mb="md">
                      <Center>
                        <Image
                          src="/images/badges/donate.png"
                          className={classes.image}
                          width={128}
                          height={128}
                          alt="donate"
                        />
                      </Center>
                      <Title className={classes.cardTitle} order={2} align="center" mt="md">
                        {t('One-time Donation')}
                      </Title>
                    </Stack>
                    <PlanBenefitList
                      benefits={[
                        { content: t('Unique Donator badge') },
                        { content: t('Unique nameplate color') },
                      ]}
                    />
                    <DonateButton>
                      <Button>{t('Donate')}</Button>
                    </DonateButton>
                  </Stack>
                </Card>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>
        </Tabs>
      </Container>
    </>
  );
}

const useStyles = createStyles((theme) => ({
  title: {
    [theme.fn.smallerThan('sm')]: {
      fontSize: 24,
    },
  },
  introText: {
    [theme.fn.smallerThan('sm')]: {
      fontSize: 14,
    },
  },
  image: {
    [theme.fn.smallerThan('sm')]: {
      width: 96,
      marginBottom: theme.spacing.xs,
    },
  },
  cardTitle: {
    [theme.fn.smallerThan('sm')]: {
      fontSize: 20,
    },
  },
}));

export const getServerSideProps = createServerSideProps({
  useSSG: true,
  resolver: async ({ ssg }) => {
    await ssg?.stripe.getPlans.prefetch();
    await ssg?.stripe.getUserSubscription.prefetch();
  },
});
