import { Request, Response, Router } from "express";

import { fromJson } from "../types/DeploymentRequest";
import pipeline, { PipelineResult } from "../pipeline";

const router = Router();

router.post("/", (req: Request, res: Response) => {
  // @ts-ignore added by middleware
  const requestId = req.id;

  pipeline(requestId, fromJson(req.body))
    .then((result: PipelineResult) => {
      res.status(201).send({ manifest: result.manifestFilename });
    })
    .catch(e => {
      res.status(500).send({ error: e });
    });
});

export { router as default };
