import fs from "fs";
import path from "path";
import sanitizeFilename from "sanitize-filename";

import DeploymentRequest from "../types/DeploymentRequest";

import sheetToSqlite from "./sheetToSqlite";
import sqliteToJsonTransform from "./sqliteToJsonTransform";
import compressJson from "./compressJson";
import writeToS3 from "./writeToS3";
import writeManifest from "./writeManifest";

interface PipelineResult {
  dbPath?: string;
  jsonFiles?: string[];
  jsonFilesCompressed?: string[];
  putParams?: object;
  manifestFilename: string;
  manifest: {
    [key: string]: string;
  };
}

interface PipelineContext {
  id: string;
  request: DeploymentRequest;
  output: PipelineResult;
}

type PipelineMethod = (context: PipelineContext) => Promise<string>;

// These return promises with log messages and will be executed in order
const PIPELINE: PipelineMethod[] = [
  sheetToSqlite,
  sqliteToJsonTransform,
  compressJson,
  writeToS3,
  writeManifest
];

async function pipeline(requestId: string, deployment: DeploymentRequest) {
  const context: PipelineContext = {
    id: requestId,
    request: deployment,
    output: {
      manifestFilename: sanitizeFilename(
        `bootlegger-manifest-${deployment.environment}-${path.basename(
          deployment.spreadsheetName
        )}.json`
      ),
      manifest: {}
    }
  };

  try {
    console.log(
      `[${requestId}] Beginning pipeline for ${deployment.spreadsheetName} (${
        deployment.environment
      })...`
    );
    for (const item of PIPELINE) {
      console.log(`[${requestId}] ${await item(context)}`);
    }
  } catch (e) {
    console.log(
      `[${requestId}] An error occurred (500 will be returned): ${e}`
    );
    throw e;
  } finally {
    const filesToCleanup = [
      context.output.dbPath,
      ...(context.output.jsonFiles || []),
      ...(context.output.jsonFilesCompressed || [])
    ];

    filesToCleanup.forEach(item => item && fs.unlink(item, () => {}));
  }

  return context.output;
}

export { pipeline as default, PipelineContext, PipelineResult };
