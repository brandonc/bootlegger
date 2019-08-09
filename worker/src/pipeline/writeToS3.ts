import aws from "aws-sdk";
import fs from "fs";
import path from "path";

import { IPipelineContext } from "./";

let s3: null | aws.S3 = null;

function configure() {
  if (s3) {
    return;
  }

  if (
    !process.env.S3_ENDPOINT ||
    !process.env.AWS_ACCESS_KEY_ID ||
    !process.env.AWS_SECRET_ACCESS_KEY
  ) {
    throw Error(
      "Cannot start: AWS config missing. See README Installation for details",
    );
  }

  const s3Config = {
    accessKeyId: String(process.env.AWS_ACCESS_KEY_ID),
    endpoint: String(process.env.S3_ENDPOINT),
    secretAccessKey: String(process.env.AWS_SECRET_ACCESS_KEY),
  };

  s3 = new aws.S3(s3Config);
}

function writeFileToS3(
  filePath: string,
  key: string,
  addlPutParams?: object | undefined,
) {
  const fileStream = fs.createReadStream(filePath);

  configure();

  const putParams = {
    ACL: "public-read",
    Body: fileStream,
    Bucket: String(process.env.S3_BUCKET_NAME),
    Key: key,
    ...addlPutParams,
  };

  return new Promise<string>((resolve, reject) => {
    if (s3 === null) {
      throw Error("AWS not configured");
    }

    s3.putObject(
      putParams,
      (err: aws.AWSError, data: aws.S3.PutObjectOutput) => {
        if (err) {
          reject(err);
        } else {
          resolve(`Data uploaded successfully: ${data.ETag}`);
        }
      },
    );
  });
}

function writeToS3(context: IPipelineContext) {
  if (
    !context.output.jsonFiles ||
    Object.keys(context.output.jsonFiles).length === 0
  ) {
    return Promise.reject("No files to upload");
  }

  const innerPromises = Object.keys(context.output.jsonFiles || {}).map(id => {
    const jsonFile = (context.output.jsonFiles || {})[id];
    const key = `bootlegger-${context.id}/${path.basename(jsonFile)}`;

    context.output.manifest[id] = key;

    return writeFileToS3(jsonFile + ".gz", key, context.output.putParams);
  });

  return new Promise<string>((resolve, reject) => {
    Promise.all(innerPromises)
      .then((results: string[]) => {
        resolve(results.join("\n"));
      })
      .catch(reason => reject(reason));
  });
}

export { writeToS3 as default, writeFileToS3 };
