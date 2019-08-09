import { Request, Response, Router } from "express";

import logger from "../../logger";
import IDeploymentRequest, { fromJson } from "../types/DeploymentRequest";

const router = Router();

// tslint:disable-next-line
const faktory = require("faktory-worker");

const enqueue = async (request: IDeploymentRequest) => {
  const client = await faktory.connect();
  await client.job("PipelineBegin", request).push();
  await client.close();
};

router.post("/", (req: Request, res: Response) => {
  // @ts-ignore added by middleware
  const requestId = req.id;

  if (!req.body.apiSecret || req.body.apiSecret !== process.env.API_SECRET) {
    res.status(401).send({ error: "Unauthorized" });
    return;
  }

  enqueue(fromJson(requestId, req.body))
    .then(() => {
      logger.info(`Enqueued ${requestId}`);

      res.status(201).send({ deploymentId: requestId });
    })
    .catch(reason =>
      res.status(500).send({
        error: `Could not contact job server. The error returned was ${reason}`,
      }),
    );
});

export { router as default };
