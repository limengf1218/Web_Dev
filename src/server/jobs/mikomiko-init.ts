import { createJob, getJobDate } from './job';
import { dbWrite } from '~/server/db/client';
import { CosmeticType, CosmeticSource } from '@prisma/client';
import { env } from '~/env/server.mjs';

export const mikomikoInit = createJob('mikomiko-init', '0 0 5 31 2 ?', async () => {
  const [lastInit, setLastInit] = await getJobDate('last-mikomiko-init');

  console.log(lastInit);

  const productData = {
    id: 'Donate',
    active: true,
    name: 'Donate',
    description: 'Donate',
    metadata: { data: 'metadata' },
    defaultPriceId: 'Donate',
  };
  await dbWrite.product.upsert({
    where: { id: 'Donate' },
    update: productData,
    create: productData,
  });

  const priceData = {
    id: 'Donate',
    productId: 'Donate',
    active: true,
    currency: 'CNY',
    description: 'Donate',
    type: 'Donate',
    unitAmount: parseInt(env['WECHAT_DONATE_AMOUNT']),
    interval: 'interval',
    intervalCount: 0,
    metadata: { data: 'metadata' },
  };
  await dbWrite.price.upsert({
    where: { id: 'Donate' },
    update: priceData,
    create: priceData,
  });

  const badgeData = {
    name: '捐赠者',
    type: 'Badge' as CosmeticType,
    source: 'Purchase' as CosmeticSource,
    permanentUnlock: true,
    data: { url: '/images/badges/donate.png' },
    createdAt: new Date(),
    productId: 'Donate',
  };
  await dbWrite.cosmetic.upsert({
    where: { id: 1 },
    create: badgeData,
    update: badgeData,
  });
  const nameplateData = {
    name: '捐赠者',
    type: 'NamePlate' as CosmeticType,
    source: 'Purchase' as CosmeticSource,
    permanentUnlock: true,
    data: { variant: 'gradient', gradient: { from: 'pink', to: 'red', deg: 45 } },
    createdAt: new Date(),
    productId: 'Donate',
  };
  await dbWrite.cosmetic.upsert({
    where: { id: 2 },
    create: nameplateData,
    update: nameplateData,
  });

  await setLastInit();
});
