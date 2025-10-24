import express from "express";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env.js";
import router from "./routes/index.js";
import { errorHandler } from "./middleware/error.js";

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// 🔹 Quan trọng
app.use("/api", router);

app.use(errorHandler);

export default app;
