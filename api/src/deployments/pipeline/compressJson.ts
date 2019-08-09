import { spawn } from "child_process";
import fs from "fs";

import { IPipelineContext } from "./";

function compressJson(context: IPipelineContext) {
  return new Promise<string>((resolve, reject) => {
    const jsonFiles = Object.values(context.output.jsonFiles || {});

    if (jsonFiles.length === 0) {
      return reject("No files to compress");
    }

    const jsonFileSize = jsonFiles.reduce((acc, filePath) => {
      return acc + fs.statSync(filePath).size;
    }, 0);

    // tslint:disable-next-line
    console.log("gzipping " + jsonFiles.join(","));

    const gzip = spawn("gzip", ["-9", ...jsonFiles]);

    gzip.on("exit", (code: number | null) => {
      if (code !== 0) {
        reject(`gzip failed with code ${code}`);
      } else {
        if (jsonFiles.length === 0) {
          reject(
            "Somehow the output files to compress disappeared. This should never happen.",
          );
          return;
        }

        context.output.jsonFilesCompressed = jsonFiles.map(
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
          `Compressed ${jsonFiles.length} file(s), saving ${jsonFileSize -
            compressedFileSize} bytes`,
        );
      }
    });
  });
}

export { compressJson as default };
