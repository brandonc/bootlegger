import { Request, Response, Router } from "express";

import pipeline, { IPipelineResult } from "../pipeline";
import { fromJson } from "../types/DeploymentRequest";

const router = Router();

router.post("/", (req: Request, res: Response) => {
  // @ts-ignore added by middleware
  const requestId = req.id;

  if (!req.body.apiSecret || req.body.apiSecret !== process.env.API_SECRET) {
    res.status(401).send({ error: "Unauthorized" });
    return;
  }

  pipeline(requestId, fromJson(req.body))
    .then((result: IPipelineResult) => {
      res.status(201).send({ manifest: result.manifestFilename });
    })
    .catch(e => {
      res.status(500).send({ error: e });
    });
});

export { router as default };
