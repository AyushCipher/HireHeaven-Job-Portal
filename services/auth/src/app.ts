import express from "express";
import authRoutes from "./routes/auth.js";
import { connectKafka } from "./producer.js";
import cors from "cors";
import { rateLimiter } from "./middleware/rateLimiter.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use(
  rateLimiter({ windowSeconds: 60, maxRequests: 100, prefix: "auth-global" })
);

connectKafka();

app.use("/api/auth", authRoutes);

export default app;
