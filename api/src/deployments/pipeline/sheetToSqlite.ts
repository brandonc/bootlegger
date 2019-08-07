import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import tmp from "tmp";

import { IPipelineContext } from ".";

const SECRET_PATH = path.resolve(__dirname, "secrets", "gs.json");

function ensureSecret(reject: (reason?: any) => void) {
  if (!fs.existsSync(SECRET_PATH)) {
    reject(`${SECRET_PATH} is missing. Please see README for more details.`);
  }
}

function sheetToSqlite(context: IPipelineContext) {
  const { spreadsheetName } = context.request;

  const sqliteFile = tmp.tmpNameSync({
    postfix: ".sqlite",
    prefix: "gs-",
  });
  return new Promise<string>((resolve, reject) => {
    ensureSecret(reject);
    const sqlitebiter = spawn("sqlitebiter", [
      "-o",
      sqliteFile,
      "gs",
      SECRET_PATH,
      spreadsheetName,
    ]);

    let output = "";
    sqlitebiter.stdout.on("data", (data: string) => {
      output = output + data;
    });

    sqlitebiter.stderr.on("data", (data: string) => {
      output = output + data;
    });

    sqlitebiter.on("exit", (code: number | null) => {
      if (code === 0) {
        context.output.dbPath = sqliteFile;
        resolve(output);
      } else {
        reject(output);
      }
    });
  });
}

export { sheetToSqlite as default };
