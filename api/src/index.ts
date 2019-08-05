import dotenv from "dotenv";

// Load secrets environment variables
dotenv.config({ path: path.resolve(__dirname, "secrets", "vars") });

import path from "path";
import express, { Response } from "express";
import bodyParser from "body-parser";
import addRequestId from "express-request-id";

import deploymentsRoutes from "./deployments/routes";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const app = express();

app.use(addRequestId());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/health", (_, res: Response) => {
  res.status(200).send("OK");
});

app.use("/deployments", deploymentsRoutes);

app.listen(PORT, () => {
  console.log("Listening on port " + PORT);
});
