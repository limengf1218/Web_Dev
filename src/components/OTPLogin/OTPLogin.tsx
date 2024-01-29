import { Group, Stack, Button } from '@mantine/core';
import { signIn } from 'next-auth/react';
import { useState, useCallback } from 'react';
import { string, z } from 'zod';
import { SocialButton } from '~/components/Social/SocialButton';
import { Form, InputText, useForm } from '~/libs/form';
import OtpInput from 'react-otp-input';
import Countdown from 'react-countdown';
import { useTranslation } from 'react-i18next';

const schema = z.object({ phone: z.string() });
export const OTPLogin = () => {
  const { t } = useTranslation();
  const [sendOTP, setSendOTP] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [disableOTP, setDisableOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [phone, setPhone] = useState('');
  const form = useForm({ schema });
  const handleSendOTP = ({ phone }: z.infer<typeof schema>) => {
    const outputPhone = phone + '@mikomiko.otp';
    setDisableOTP(true);
    setShowOTP(true);
    signIn('otp', { email: outputPhone, redirect: false });
  };

  const handleSignIn = useCallback(() => {
    window.location.href = `/api/auth/callback/otp?email=${encodeURIComponent(
      phone + '@mikomiko.otp'
    )}&token=${otp}`;
  }, [otp, phone]);

  return (
    <Form form={form} onSubmit={handleSendOTP}>
      <Stack>
        <InputText
          name="phone"
          type="number"
          label={t('Phone Number')}
          placeholder="(只允许中国的号码)"
          withAsterisk
          clearable={false}
          onChange={(e) => {
            setPhone(e.target.value);
            if (e.target.value != '') setSendOTP(true);
            else setSendOTP(false);
          }}
          rightSection={
            <Button
              variant="subtle"
              type="submit"
              disabled={!sendOTP || disableOTP}
              style={{ width: 150 }}
            >
              {t('Send OTP')}
              {disableOTP && (
                <Countdown
                  date={Date.now() + 60000}
                  intervalDelay={0}
                  precision={1}
                  renderer={(props) => <div> &nbsp; ({props.total.toString().slice(0, 2)})</div>}
                  onComplete={() => setDisableOTP(false)}
                />
              )}
            </Button>
          }
          rightSectionWidth={150}
        />
        {showOTP && (
          <OtpInput
            value={otp}
            onChange={setOtp}
            numInputs={6}
            containerStyle={{ margin: 'auto' }}
            inputStyle={{ padding: 5, margin: 8, fontSize: 30, width: 36 }}
            renderInput={(props) => <input {...props} />}
          />
        )}
        <SocialButton provider="otp" disabled={otp.length != 6} onClick={handleSignIn} />
      </Stack>
    </Form>
  );
};
