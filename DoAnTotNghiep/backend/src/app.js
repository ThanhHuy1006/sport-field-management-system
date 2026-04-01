import express from "express";
import cors from "cors";
import path from "path";
import routes from "./routes/index.js";
import { errorMiddleware } from "./core/middlewares/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/v1", routes);

app.use(errorMiddleware);

export default app;