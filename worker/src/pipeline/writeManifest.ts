import fs from "fs";
import tmp from "tmp";

import { IPipelineContext } from "./";
import { writeFileToS3 } from "./writeToS3";

function writeManifest(context: IPipelineContext) {
  const manifestPath = tmp.tmpNameSync({
    postfix: ".json",
    prefix: "manifest-",
  });

  fs.writeFileSync(manifestPath, JSON.stringify(context.output.manifest), {
    encoding: "utf8",
  });

  return writeFileToS3(`${manifestPath}`, context.output.manifestFilename, {
    CacheControl: "max-age=60",
    ContentType: "application/json",
  });
}

export { writeManifest as default };
