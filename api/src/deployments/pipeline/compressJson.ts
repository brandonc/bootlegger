import { spawn } from "child_process";
import fs from "fs";

import { IPipelineContext } from "./";

function compressJson(context: IPipelineContext) {
  return new Promise<string>((resolve, reject) => {
    if (!context.output.jsonFiles) {
      return reject("No files to compress");
    }

    const jsonFileSize = (context.output.jsonFiles || []).reduce(
      (acc, filePath) => {
        return acc + fs.statSync(filePath).size;
      },
      0,
    );

    const gzip = spawn("gzip", ["-9", ...context.output.jsonFiles]);

    gzip.on("exit", (code: number | null) => {
      if (code !== 0) {
        reject(`gzip failed with code ${code}`);
      } else {
        if (!context.output.jsonFiles) {
          reject(
            "Somehow the output files to compress disappeared. This should never happen.",
          );
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
