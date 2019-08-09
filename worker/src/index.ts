import logger from "./logger";
import pipeline from "./pipeline";
import IDeploymentRequest from "./types/DeploymentRequest";

// tslint:disable-next-line
const faktory = require("faktory-worker");

const REQUIRED_CONFIG = [
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "S3_BUCKET_NAME",
  "S3_ENDPOINT",
];

let errors = false;
REQUIRED_CONFIG.forEach(envName => {
  if (!process.env[envName]) {
    logger.error(`${envName} is not set. See README for details.`);
    errors = true;
  }
});

if (errors) {
  process.exit(1);
}

faktory.register("PipelineBegin", async (request: IDeploymentRequest) => {
  await pipeline(request)
    .then(() => logger.info(`[${request.requestId}] Complete`))
    .catch(() => {
      // No op - already logged.
    });
});

logger.info("Initialized");

faktory.work({
  concurrency: 2,
  timeout: 30 * 1000,
});
