import { PipelineContext } from "./";
import tmp from "tmp";
import { exec, ExecException } from "child_process";

function sqliteToJsonTransform(context: PipelineContext) {
  const { environment, transform } = context.request;
  const { dbPath } = context.output;

  if (!dbPath) {
    return Promise.reject("No dbPath to transform");
  }

  const jsonFile = tmp.tmpNameSync({
    prefix: `${environment}-`,
    postfix: ".json"
  });

  return new Promise<string>((resolve, reject) => {
    exec(
      `sqlite3 ${dbPath} "${transform}" > ${jsonFile}`,
      (err: ExecException | null) => {
        if (err !== null) {
          reject(err);
        } else {
          context.output.jsonFiles = [jsonFile];
          resolve(`Query transform output written to ${jsonFile}`);
        }
      }
    );
  });
}

export { sqliteToJsonTransform as default };
