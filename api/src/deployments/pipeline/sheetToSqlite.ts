import { exec, ExecException } from "child_process";
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
  const cmd = `sqlitebiter -o "${sqliteFile}" gs ${SECRET_PATH} "${spreadsheetName}"`;

  return new Promise<string>((resolve, reject) => {
    ensureSecret(reject);
    return exec(cmd, (err: ExecException | null, _: string, stderr: string) => {
      if (err !== null) {
        reject(err);
      } else {
        context.output.dbPath = sqliteFile;

        // For some reason sqlitebiter outputs to stderr
        resolve(stderr);
      }
    });
  });
}

export { sheetToSqlite as default };
