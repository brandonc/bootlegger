import path from "path";
import tmp from "tmp";
import fs from "fs";
import { exec, ExecException } from "child_process";

import { PipelineContext } from ".";

const SECRET_PATH = path.resolve(__dirname, "secrets", "gs.json");

function ensureSecret(reject: (reason?: any) => void) {
  if (!fs.existsSync(SECRET_PATH)) {
    reject(`${SECRET_PATH} is missing. Please see README for more details.`);
  }
}

function sheetToSqlite(context: PipelineContext) {
  const { spreadsheetName } = context.request;

  const sqliteFile = tmp.tmpNameSync({
    prefix: "gs-",
    postfix: ".sqlite"
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
