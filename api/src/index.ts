import bodyParser from "body-parser";
import express, { Response } from "express";
import addRequestId from "express-request-id";

import deploymentsRoutes from "./deployments/routes";
import logger from "./logger";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const app = express();

app.use(addRequestId());
app.use(bodyParser.json({ limit: "20mb" }));
app.use(bodyParser.urlencoded({ limit: "20mb", extended: true }));

app.get("/health", (_, res: Response) => {
  res.status(200).send("OK");
});

app.use("/deployments", deploymentsRoutes);

app.listen(PORT, () => {
  logger.info("Listening on port " + PORT);
});
