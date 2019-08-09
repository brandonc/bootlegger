import { spawn } from "child_process";
import fs from "fs";
import tmp from "tmp";

import { IPipelineContext } from "./";

function sqliteToJsonTransform(context: IPipelineContext) {
  const { environment, transforms } = context.request;
  const { dbPath } = context.output;

  const transformPromises = transforms.map(
    ({ id, transform }: { id: string; transform: string }) => {
      return new Promise<string>((resolve, reject) => {
        if (!dbPath) {
          reject("No dbPath to transform");
          return;
        }

        const sqlite = spawn("sqlite3", [dbPath, transform]);
        const jq = spawn("jq", ["-cse", "."]);

        sqlite.stderr.on("data", (error: string) => {
          reject(("sqlite3 failed: " + error).trimEnd());
        });

        sqlite.stdout.pipe(jq.stdin);

        const jsonFile = tmp.tmpNameSync({
          postfix: ".json",
          prefix: `${environment}-${id}-`,
        });

        jq.stdout.pipe(fs.createWriteStream(jsonFile, { flags: "w" }));

        jq.on("close", (code: number) => {
          if (code !== 0) {
            reject(`jq failed with code ${code}`);
          } else {
            context.output.jsonFiles = context.output.jsonFiles || {};

            context.output.jsonFiles[id] = jsonFile;
            resolve(`Transform succeeded, outut written to ${jsonFile}`);
          }
        });
      });
    },
  );

  return new Promise<string>((resolve, reject) => {
    Promise.all(transformPromises)
      .then((logs: string[]) => {
        resolve(logs.join("\n"));
      })
      .catch(reason => reject(reason));
  });
}

export { sqliteToJsonTransform as default };
