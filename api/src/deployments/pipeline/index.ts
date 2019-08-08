import fs from "fs";
import path from "path";
import sanitizeFilename from "sanitize-filename";

import IDeploymentRequest from "../types/DeploymentRequest";

import logger from "../../logger";
import compressJson from "./compressJson";
import sheetToSqlite from "./sheetToSqlite";
import sqliteToJsonTransform from "./sqliteToJsonTransform";
import writeManifest from "./writeManifest";
import writeToS3 from "./writeToS3";

interface IPipelineResult {
  dbPath?: string;
  jsonFiles?: string[];
  jsonFilesCompressed?: string[];
  putParams?: object;
  manifestFilename: string;
  manifest: {
    [key: string]: string;
  };
}

interface IPipelineContext {
  id: string;
  request: IDeploymentRequest;
  output: IPipelineResult;
}

type PipelineMethod = (context: IPipelineContext) => Promise<string>;

// These return promises with log messages and will be executed in order
const PIPELINE: PipelineMethod[] = [
  sheetToSqlite,
  sqliteToJsonTransform,
  compressJson,
  writeToS3,
  writeManifest,
];

async function pipeline(requestId: string, deployment: IDeploymentRequest) {
  const context: IPipelineContext = {
    id: requestId,
    output: {
      manifest: {},
      manifestFilename: sanitizeFilename(
        `bootlegger-manifest-${deployment.environment}-${path.basename(
          deployment.spreadsheetName,
        )}.json`,
      ),
    },
    request: deployment,
  };

  try {
    logger.info(
      `[${new Date().toISOString()}][${requestId}] Beginning pipeline for ${
        deployment.spreadsheetName
      } (${deployment.environment})...`,
    );
    for (const item of PIPELINE) {
      const logOutput = await item(context);
      logger.info(`[${new Date().toISOString()}][${requestId}] ${logOutput}`);
    }
  } catch (e) {
    logger.error(
      `[${new Date().toISOString()}][${requestId}] An error occurred (500 will be returned): ${e}`,
    );
    throw e;
  } finally {
    const filesToCleanup = [
      context.output.dbPath,
      ...(context.output.jsonFiles || []),
      ...(context.output.jsonFilesCompressed || []),
    ];

    filesToCleanup.forEach(
      item =>
        item &&
        fs.unlink(item, () => {
          // No op
        }),
    );
  }

  return context.output;
}

export { pipeline as default, IPipelineContext, IPipelineResult };
