import express from "express";
import jobRoutes from "./routes/job.js";
import cors from "cors";
import { rateLimiter } from "./middlewares/rateLimiter.js";

const app = express();

app.use(cors());

app.use(express.json());

app.use(
  rateLimiter({ windowSeconds: 60, maxRequests: 100, prefix: "job-global" })
);

app.use("/api/job", jobRoutes);

export default app;
