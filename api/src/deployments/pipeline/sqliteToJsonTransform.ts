import { spawn } from "child_process";
import fs from "fs";
import tmp from "tmp";

import { IPipelineContext } from "./";

function sqliteToJsonTransform(context: IPipelineContext) {
  const { environment, transform } = context.request;
  const { dbPath } = context.output;

  if (!dbPath) {
    return Promise.reject("No dbPath to transform");
  }

  const jsonFile = tmp.tmpNameSync({
    postfix: ".json",
    prefix: `${environment}-`,
  });

  return new Promise<string>((resolve, reject) => {
    const sqlite = spawn("sqlite3", [dbPath, transform]);
    const jq = spawn("jq", ["-cse", "."]);

    sqlite.stderr.on("data", error => {
      reject(("sqlite3 failed: " + error).trimEnd());
    });

    sqlite.stdout.pipe(jq.stdin);

    jq.stdout.pipe(fs.createWriteStream(jsonFile, { flags: "w" }));

    jq.on("close", (code: number) => {
      if (code !== 0) {
        reject(`jq failed with code ${code}`);
      } else {
        context.output.jsonFiles = [jsonFile];
        resolve(`Transform succeeded, outut written to ${jsonFile}`);
      }
    });
  });
}

export { sqliteToJsonTransform as default };
