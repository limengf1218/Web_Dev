import { z } from 'zod';
import { addOnDemandRunStrategiesJob } from '~/server/jobs/add-on-demand-run-strategies';
import { deliverPurchasedCosmetics } from '~/server/jobs/deliver-purchased-cosmetics';
import { processImportsJob } from '~/server/jobs/process-imports';
import { scanFilesJob } from '~/server/jobs/scan-files';
import { selectFeaturedImages } from '~/server/jobs/select-featured-images';
import { sendNotificationsJob } from '~/server/jobs/send-notifications';
import { sendWebhooksJob } from '~/server/jobs/send-webhooks';
import { updateMetricsJob } from '~/server/jobs/update-metrics';
import { WebhookEndpoint } from '~/server/utils/endpoint-helpers';
import { createLogger } from '~/utils/logging';
import { redis } from '~/server/redis/client';
import { removeDisconnectedImages } from '~/server/jobs/remove-disconnected-images';
import { pushDiscordMetadata } from '~/server/jobs/push-discord-metadata';
import { applyDiscordRoles } from '~/server/jobs/apply-discord-roles';
import { Job } from '~/server/jobs/job';
import { applyVotedTags } from '~/server/jobs/apply-voted-tags';
import { disabledVotedTags } from '~/server/jobs/disabled-voted-tags';
import { removeOldDrafts } from '~/server/jobs/remove-old-drafts';
import { resetToDraftWithoutRequirements } from '~/server/jobs/reset-to-draft-without-requirements';
import { isProd } from '~/env/other';
import { updateMetricsModelJob } from '~/server/jobs/update-metrics-models';
import { applyContestTags } from '~/server/jobs/apply-contest-tags';
import { applyNsfwBaseline } from '~/server/jobs/apply-nsfw-baseline';
import { leaderboardJobs } from '~/server/jobs/prepare-leaderboard';
import { deliverLeaderboardCosmetics } from '~/server/jobs/deliver-leaderboard-cosmetics';
import { mikomikoInit } from '~/server/jobs/mikomiko-init';
const jobs: Job[] = [
  scanFilesJob,
  updateMetricsJob,
  updateMetricsModelJob,
  processImportsJob,
  sendNotificationsJob,
  sendWebhooksJob,
  addOnDemandRunStrategiesJob,
  deliverPurchasedCosmetics,
  deliverLeaderboardCosmetics,
  selectFeaturedImages,
  removeDisconnectedImages,
  pushDiscordMetadata,
  applyVotedTags,
  disabledVotedTags,
  removeOldDrafts,
  resetToDraftWithoutRequirements,
  applyContestTags,
  ...applyDiscordRoles,
  applyNsfwBaseline,
  ...leaderboardJobs,
  mikomikoInit,
];

const log = createLogger('jobs', 'green');

export default WebhookEndpoint(async (req, res) => {
  const { run: runJob } = querySchema.parse(req.query);
  const ran = [];
  const toRun = [];
  const alreadyRunning = [];
  const afterResponse = [];

  for (const { name, run, options } of jobs) {
    if (runJob) {
      if (runJob !== name) continue;
    }

    if (await isLocked(name)) {
      log(`${name} already running`);
      alreadyRunning.push(name);
      continue;
    }

    const processJob = async () => {
      const jobStart = Date.now();
      const axiom = req.log.with({ scope: 'job', name });
      try {
        log(`${name} starting`);
        axiom.info(`starting`);
        lock(name, options.lockExpiration);
        await run();
        log(`${name} successful: ${((Date.now() - jobStart) / 1000).toFixed(2)}s`);
        axiom.info('success', { duration: Date.now() - jobStart });
      } catch (e) {
        log(`${name} failed: ${((Date.now() - jobStart) / 1000).toFixed(2)}s`, e);
        axiom.error(`failed`, { duration: Date.now() - jobStart, error: e });
      } finally {
        unlock(name);
      }
    };

    if (options.shouldWait) {
      await processJob();
      ran.push(name);
    } else {
      afterResponse.push(processJob);
      toRun.push(name);
    }
  }

  res.status(200).json({ ok: true, ran, toRun, alreadyRunning });
  await Promise.all(afterResponse.map((run) => run()));
});

const querySchema = z.object({
  run: z.string().optional(),
});

async function isLocked(name: string) {
  if (!isProd) return false;
  return (await redis?.get(`job:${name}`)) === 'true';
}

async function lock(name: string, lockExpiration: number) {
  if (!isProd) return;
  await redis?.set(`job:${name}`, 'true', { EX: lockExpiration });
}

async function unlock(name: string) {
  if (!isProd) return;
  await redis?.del(`job:${name}`);
}
