import { useTranslation } from 'react-i18next';
import {
  Button,
  Card,
  Stack,
  Text,
  Title,
  Grid,
  Alert,
  TextInput,
  NumberInput,
  Modal,
  Radio,
} from '@mantine/core';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { trpc } from '~/utils/trpc';
import { showSuccessNotification } from '~/utils/notifications';
import { useState, useEffect } from 'react';
import { useDisclosure } from '@mantine/hooks';
import Countdown from 'react-countdown';
import OtpInput from 'react-otp-input';
import { IconCheck } from '@tabler/icons-react';

export function BasicCard() {
  const { t } = useTranslation();
  const [opened, { open, close }] = useDisclosure(false);
  const currentUser = useCurrentUser();

  const queryUtils = trpc.useContext();

  const [userLoginType, setUserLoginType] = useState(
    currentUser?.email?.endsWith('@mikomiko.otp') ? 'phone' : 'email'
  );

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [emailDisplay, setEmailDisplay] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [submitReady, setSubmitReady] = useState(false);
  const [verified, setVerified] = useState(false);
  const [disableOTP, setDisableOTP] = useState(false);
  const [sendOTP, setSendOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [targetOTP, setTargetOTP] = useState('');

  const { mutate, isLoading, error } = trpc.user.update.useMutation({
    async onSuccess(user) {
      showSuccessNotification({ message: t('Your profile has been saved') });
      await queryUtils.review.getAll.invalidate();
      await queryUtils.comment.getAll.invalidate();
      currentUser?.refresh();

      if (user) {
        console.log(user.email);
        if (user && user.email) {
          setEmail(user.email);
          setEmailDisplay(user.email);
          setPhone('');
        }
        if (user && user.email && user.email.endsWith('@mikomiko.otp')) {
          setEmail('');
          setEmailDisplay('');
          setPhone(user.email.split('@')[0]);
        }
        setSubmitReady(false);
      }
    },
  });

  useEffect(() => {
    if (currentUser && currentUser.email && currentUser.email.endsWith('@mikomiko.otp')) {
      setPhone(currentUser.email?.split('@')[0]);
    } else if (currentUser && currentUser.email) {
      setEmail(currentUser.email);
      setEmailDisplay(currentUser.email);
    }
  }, [currentUser]);

  const handleSendOTP = (newOtp: string) => {
    setDisableOTP(true);
    if (userLoginType === 'phone') {
      fetch('/api/admin/send-sms-otp', {
        method: 'POST',
        body: JSON.stringify({
          identifier: email,
          token: newOtp,
        }),
      });
    } else if (userLoginType === 'email') {
      fetch('/api/admin/send-email-otp', {
        method: 'POST',
        body: JSON.stringify({
          identifier: email,
          token: newOtp,
        }),
      });
    }
  };

  return (
    <Card withBorder>
      <Stack>
        <Title order={2}>{t('User Login Type')}</Title>
        {error && (
          <Alert color="red" variant="light">
            {error.data?.code === 'CONFLICT' ? t('That email is already taken') : error.message}
          </Alert>
        )}

        <Grid>
          <Grid.Col xs={12}>
            <Radio.Group
              style={{ width: '100%' }}
              value={userLoginType}
              onChange={(value: string) => {
                setUserLoginType(value);
                if (
                  currentUser &&
                  currentUser.email &&
                  currentUser.email.endsWith('@mikomiko.otp')
                ) {
                  setEmail('');
                  setEmailDisplay('');
                  setPhone(currentUser.email?.split('@')[0]);
                } else if (currentUser && currentUser.email) {
                  setEmail(currentUser.email);
                  setEmailDisplay(currentUser.email);
                  setPhone('');
                }
                setEmailError(false);
                setSubmitReady(false);
              }}
              error={
                <Text color="red">
                  {`* ${t(
                    'Please select to bind either an email or a mobile SMS. Binding one of them will automatically unbind the other method'
                  )}`}
                </Text>
              }
            >
              <Grid justify="center" align="center" mb="sm">
                <Grid.Col xs={4}>
                  <Radio value="email" label={t('Email')} />
                </Grid.Col>
                <Grid.Col xs={8}>
                  <TextInput
                    name="email"
                    value={emailDisplay}
                    disabled={!currentUser || userLoginType !== 'email'}
                    onChange={(e) => {
                      setVerified(false);
                      setEmail(e.target.value);
                      setEmailDisplay(e.target.value);
                      if (/\S+@\S+\.\S+/.test(e.target.value)) {
                        setEmailError(false);
                        if (currentUser && e.target.value != currentUser.email)
                          setSubmitReady(true);
                        else setSubmitReady(false);
                      } else {
                        setEmailError(true);
                        setSubmitReady(false);
                      }
                    }}
                    error={emailError ? t('Invalid email') : ''}
                  />
                </Grid.Col>
                <Grid.Col xs={4}>
                  <Radio value="phone" label={t('Phone')} />
                </Grid.Col>
                <Grid.Col xs={8}>
                  <NumberInput
                    hideControls
                    name="phone"
                    disabled={!currentUser || userLoginType !== 'phone'}
                    value={phone ? parseInt(phone) : undefined}
                    onChange={(value) => {
                      if (value) {
                        setVerified(false);
                        setPhone(value.toString());
                        setEmailError(false);
                        const newEmail = value.toString() + '@mikomiko.otp';
                        setEmail(newEmail);
                        if (currentUser && newEmail != currentUser.email) setSubmitReady(true);
                        else setSubmitReady(false);
                      } else setSubmitReady(false);
                    }}
                  />
                </Grid.Col>
              </Grid>
            </Radio.Group>
          </Grid.Col>
          <Grid.Col xs={12} md={6}>
            {!verified && (
              <Button
                fullWidth
                disabled={verified || !submitReady}
                onClick={() => {
                  open();
                  setOtp('');
                  setSendOTP(true);
                  setDisableOTP(false);
                  const digits = '1234567890';
                  let newOtp = '';
                  for (let i = 0; i < 6; i++) {
                    newOtp += digits[Math.floor(Math.random() * 10)];
                  }
                  setTargetOTP(newOtp);
                  handleSendOTP(newOtp);
                }}
              >
                {t('Verify')}
              </Button>
            )}
            {verified && (
              <Button fullWidth color="green" rightIcon={<IconCheck />}>
                {t('Verify')}
                {t('Success')}
              </Button>
            )}

            <Modal opened={opened} onClose={close} centered>
              <Stack align="center">
                <Button
                  disabled={!sendOTP || disableOTP}
                  variant="light"
                  style={{ width: 300, marginBottom: 15 }}
                  onClick={() => handleSendOTP(targetOTP)}
                >
                  {t('Send OTP')}
                  {disableOTP && (
                    <Countdown
                      date={Date.now() + 60000}
                      intervalDelay={0}
                      precision={1}
                      renderer={(props) => (
                        <div> &nbsp; ({props.total.toString().slice(0, 2)})</div>
                      )}
                      onComplete={() => setDisableOTP(false)}
                    />
                  )}
                </Button>
                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  numInputs={6}
                  containerStyle={{ margin: 'auto' }}
                  inputStyle={{ padding: 5, margin: 8, fontSize: 30, width: 36 }}
                  renderInput={(props) => <input {...props} />}
                />
                <Button
                  size="lg"
                  style={{ width: 300, margin: 25 }}
                  disabled={otp !== targetOTP}
                  onClick={() => {
                    close();
                    setVerified(true);
                  }}
                >
                  {t('Verify')}
                </Button>
              </Stack>
            </Modal>
          </Grid.Col>
          <Grid.Col xs={12} md={6}>
            <Button
              loading={isLoading}
              fullWidth
              disabled={!submitReady || !verified}
              onClick={() => {
                if (currentUser && submitReady) {
                  const id = currentUser.id;
                  mutate({ id, email });
                  if (userLoginType == 'phone') {
                    setEmail('');
                    setEmailDisplay('');
                  } else if (userLoginType == 'email') setPhone('');
                }
              }}
            >
              {t('Save')}
            </Button>
          </Grid.Col>
        </Grid>
      </Stack>
    </Card>
  );
}
