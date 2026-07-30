import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/user.js";
import cors from "cors";
import { rateLimiter } from "./middlewares/rateLimiter.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(
  rateLimiter({ windowSeconds: 60, maxRequests: 100, prefix: "user-global" })
);

app.use("/api/user", userRoutes);

app.listen(process.env.PORT, () => {
  console.log(
    `User service is running on http://localhost:${process.env.PORT}`
  );
});
