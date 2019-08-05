import fs from "fs";
import tmp from "tmp";

import { writeFileToS3 } from "./writeToS3";
import { PipelineContext } from "./";

function writeManifest(context: PipelineContext) {
  const manifestPath = tmp.tmpNameSync({
    prefix: "manifest-",
    postfix: ".json"
  });

  fs.writeFileSync(manifestPath, JSON.stringify(context.output.manifest), {
    encoding: "utf8"
  });

  return writeFileToS3(`${manifestPath}`, context.output.manifestFilename, {
    ContentType: "application/json"
  });
}

export { writeManifest as default };
