import path from "path";
import aws from "aws-sdk";
import fs from "fs";

import { PipelineContext } from "./";

let s3: null | aws.S3 = null;

function configure() {
  if (s3) {
    return s3;
  }

  if (
    !process.env.S3_ENDPOINT ||
    !process.env.AWS_ACCESS_KEY_ID ||
    !process.env.AWS_SECRET_ACCESS_KEY
  ) {
    throw Error(
      "Cannot start: AWS config missing. See README Installation for details"
    );
  }

  const s3Config = {
    endpoint: String(process.env.S3_ENDPOINT),
    accessKeyId: String(process.env.AWS_ACCESS_KEY_ID),
    secretAccessKey: String(process.env.AWS_SECRET_ACCESS_KEY)
  };

  s3 = new aws.S3(s3Config);
  return s3;
}

function writeFileToS3(
  filePath: string,
  key: string,
  addlPutParams?: object | undefined
) {
  const fileStream = fs.createReadStream(filePath);

  const s3 = configure();

  const putParams = {
    Bucket: String(process.env.S3_BUCKET_NAME),
    Key: key,
    Body: fileStream,
    ACL: "public-read",
    ...addlPutParams
  };

  return new Promise<string>((resolve, reject) => {
    s3.putObject(
      putParams,
      (err: aws.AWSError, data: aws.S3.PutObjectOutput) => {
        if (err) {
          reject(err);
        } else {
          resolve(`Data uploaded successfully: ${data.ETag}`);
        }
      }
    );
  });
}

function writeToS3(context: PipelineContext) {
  if (!context.output.jsonFiles || context.output.jsonFiles.length === 0) {
    return Promise.reject("No files to upload");
  }

  const innerPromises = (context.output.jsonFilesCompressed || []).map(
    jsonFile => {
      const key = `bootlegger-${context.id}/${path
        .basename(jsonFile)
        .replace(/\.gz$/, "")}`;

      context.output.manifest.json = key;

      return writeFileToS3(jsonFile, key, context.output.putParams);
    }
  );

  return new Promise<string>((resolve, reject) => {
    Promise.all(innerPromises)
      .then((results: string[]) => {
        resolve(results.join("\n"));
      })
      .catch(reason => reject(reason));
  });
}

export { writeToS3 as default, writeFileToS3 };
