import { cloneElement } from 'react';
import { trpc } from '~/utils/trpc';
import { LoginPopover } from '~/components/LoginPopover/LoginPopover';
import { showErrorNotification } from '~/utils/notifications';
import { Modal, Text, Stack, Image } from '@mantine/core';
import { useState, useEffect } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { QRCode } from 'react-qrcode-logo';
import { t } from 'i18next';
import { useRouter } from 'next/router';

export function DonateButton({ children }: { children: React.ReactElement }) {
  const router = useRouter();
  const { mutate, isLoading } = trpc.wechat.createDonateSession.useMutation({
    async onSuccess({ message, url }) {
      if (url) {
        setUrl(url);
        setTradeID(message);
        open();
      } else {
        showErrorNotification({ error: new Error(message) });
      }
    },
  });

  const handleClick = () => mutate();
  const [opened, { open, close }] = useDisclosure(false);
  const [url, setUrl] = useState('');
  const [tradeID, setTradeID] = useState('');
  const [displatText, setDisplayText] = useState(
    t('Please use WeChat to scan and make the payment')
  );
  const [check, setCheck] = useState(0);

  const wechatQuery = async (tradeID: string) => {
    await fetch('/api/wechatpay/query', {
      method: 'POST',
      body: JSON.stringify({ tradeID: tradeID }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.trade_state === 'SUCCESS') {
          router.replace(`/payment/success?type=donation&cid=${data.customerId.slice(-8)}`);
        } else if (data.message) showErrorNotification({ error: new Error(data.message) });
      });
  };
  useEffect(() => {
    if (tradeID) {
      const id = setInterval(() => {
        wechatQuery(tradeID);
        setCheck(check + 1);
        if (check > 1) setDisplayText(t('Checking payment status...'));
      }, 5000);
      return () => clearInterval(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [check, tradeID]);

  return (
    <>
      <LoginPopover>
        {cloneElement(children, { onClick: handleClick, loading: isLoading })}
      </LoginPopover>
      <Modal centered opened={opened} onClose={close} withCloseButton={false}>
        <Stack align="center" sx={{ backgroundColor: '#1AAD19' }} pb="lg" spacing={0}>
          <Image src="/images/wechat-pay-logo.png" alt="WeChat Pay" />
          <QRCode
            value={url}
            logoImage="/images/android-chrome-512x512.jpg"
            logoWidth={300}
            logoOpacity={0.15}
            size={250}
            eyeRadius={25}
          />
          <Text mt="md" color="white">
            {displatText}
          </Text>
        </Stack>
      </Modal>
    </>
  );
}
