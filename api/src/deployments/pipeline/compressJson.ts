import { exec, ExecException } from "child_process";
import fs from "fs";

import { IPipelineContext } from "./";

function compressJson(context: IPipelineContext) {
  if (!context.output.jsonFiles) {
    return Promise.reject("No files to compress");
  }

  const args = context.output.jsonFiles
    .map((file: string) => `"${file}"`)
    .join(" ");

  return new Promise<string>((resolve, reject) => {
    const jsonFileSize = (context.output.jsonFiles || []).reduce(
      (acc, filePath) => {
        return acc + fs.statSync(filePath).size;
      },
      0,
    );

    exec(`gzip -9 ${args}`, (err: ExecException | null) => {
      if (err !== null) {
        reject(err);
      } else {
        if (!context.output.jsonFiles) {
          reject("No files to compress");
          return;
        }

        context.output.jsonFilesCompressed = context.output.jsonFiles.map(
          jsonFile => `${jsonFile}.gz`,
        );

        const compressedFileSize = context.output.jsonFilesCompressed.reduce(
          (acc, filePath) => {
            return acc + fs.statSync(filePath).size;
          },
          0,
        );

        context.output.putParams = {
          ContentEncoding: "gzip",
          ContentType: "binary",
        };

        resolve(
          `Compressed ${
            context.output.jsonFiles.length
          } file(s), saving ${jsonFileSize - compressedFileSize} bytes`,
        );
      }
    });
  });
}

export { compressJson as default };
