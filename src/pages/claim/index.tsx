import { useTranslation } from 'react-i18next';
import {
  Container,
  Grid,
  Group,
  Title,
  Text,
  Stack,
  List,
  TextInput,
  Textarea,
  FileInput,
  Image,
  Paper,
} from '@mantine/core';
import { Meta } from '~/components/Meta/Meta';
import { useForm } from '@mantine/form';
import { IconUpload } from '@tabler/icons-react';
import { useIsMobile } from '~/hooks/useIsMobile';
import { Dropzone } from '@mantine/dropzone';
import { IMAGE_MIME_TYPE } from '@mantine/dropzone';

export default function Claim() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const form = useForm();

  const handleDrop = () => {
    console.log('drop');
  };
  return (
    <>
      <Meta title={t('Account Claim | mikomiko')} />
      <Container size="sm">
        <Grid gutter="xl" align="center">
          <Grid.Col span={12}>
            <Group position="apart">
              <Title order={2}>{t('Creator Account Claim')}</Title>
              <Stack>
                <Text mt="md" fw={700}>
                  {t('Process to claim a creator account:')}
                </Text>
                <List type="ordered" fz="sm">
                  <List.Item>
                    {t(
                      "Find the official 'mikomiko_China' account on Civitai, and follow the 'mikomiko_China' account using the original Civitai account you wish to claim"
                    )}
                  </List.Item>
                  <List.Item>{t("Screenshot the 'Following' status")}</List.Item>
                  <List.Item>
                    {t("Screenshot your personal homepage's 'Account Setting' page")}
                  </List.Item>
                </List>
                <Text fz="sm">{t('We will respond to you within 5 business days')}</Text>
                <form>
                  <Title order={3} mb="md">
                    1. {t('What is the account you want to claim?')}
                    <span style={{ color: 'red' }}> * </span>
                  </Title>
                  <TextInput
                    mt="sm"
                    withAsterisk
                    label={t('Username')}
                    placeholder={t('Username') ?? 'Username'}
                    {...form.getInputProps('username')}
                  />
                  <Title order={3} mt="md">
                    2. {t('How can we contact you?')}
                    <span style={{ color: 'red' }}> * </span>
                  </Title>
                  <TextInput
                    mt="sm"
                    withAsterisk
                    label={t('Email') + ' ' + t('Or') + ' ' + t('Phone Number')}
                    placeholder={t('Email') + ' ' + t('Or') + ' ' + t('Phone Number')}
                    {...form.getInputProps('contact')}
                  />
                  <Title order={3} mt="md">
                    3. {t('Screenshot of following "mikomiko_China" on Civitai')}
                    <span style={{ color: 'red' }}> * </span>
                  </Title>
                  <Paper shadow="sm" p="xs" withBorder mt="sm">
                    <Grid>
                      <Grid.Col md={6}>
                        <Image
                          src="/images/claim/sample-follow-screenshot.png"
                          alt="sample-follow-screenshot"
                        />
                      </Grid.Col>
                      <Grid.Col md={6}>
                        <Dropzone
                          onDrop={handleDrop}
                          accept={IMAGE_MIME_TYPE}
                          maxFiles={1}
                          sx={{
                            flex: 1,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%',
                          }}
                        >
                          <Text color="dimmed">{t('Drop image here')}</Text>
                        </Dropzone>
                      </Grid.Col>
                    </Grid>
                  </Paper>
                  <Title order={3} mt="md">
                    4. {t('Screenshot of Account Settings on Civitai')}
                    <span style={{ color: 'red' }}> * </span>
                  </Title>
                  <Paper shadow="sm" p="xs" withBorder mt="sm">
                    <Grid>
                      <Grid.Col md={6}>
                        <Image
                          src="/images/claim/sample-account-screenshot.png"
                          alt="sample-account-screenshot"
                        />
                      </Grid.Col>
                      <Grid.Col md={6}>
                        <Dropzone
                          onDrop={handleDrop}
                          accept={IMAGE_MIME_TYPE}
                          maxFiles={1}
                          sx={{
                            flex: 1,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%',
                          }}
                        >
                          <Text color="dimmed">{t('Drop image here')}</Text>
                        </Dropzone>
                      </Grid.Col>
                    </Grid>
                  </Paper>
                  <Title order={3} mt="md">
                    5.{' '}
                    {t(
                      'Do you have any supporting evidence or additional information to provide that could help us better understand the situation? (Optional)'
                    )}
                  </Title>

                  <Grid mt="md">
                    <Grid.Col md={6}>
                      <Textarea placeholder={t('Optional content') ?? 'Optional content'} />
                    </Grid.Col>
                    <Grid.Col md={6}>
                      <Dropzone
                        onDrop={handleDrop}
                        accept={IMAGE_MIME_TYPE}
                        maxFiles={1}
                        sx={{
                          flex: 1,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: '100%',
                        }}
                      >
                        <Text color="dimmed">{t('Drop image here')}</Text>
                      </Dropzone>
                    </Grid.Col>
                  </Grid>
                </form>
              </Stack>
            </Group>
          </Grid.Col>
        </Grid>
      </Container>
    </>
  );
}
