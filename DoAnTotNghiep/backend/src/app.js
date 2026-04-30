import express from "express";
import cors from "cors";
import path from "path";
import routes from "./routes/index.js";
import { requestContextMiddleware } from "./core/middlewares/request-context.middleware.js";
import { requestLoggerMiddleware } from "./core/middlewares/request-logger.middleware.js";
import { notFoundMiddleware } from "./core/middlewares/not-found.middleware.js";
import { errorMiddleware } from "./core/middlewares/error.middleware.js";

const app = express();

app.use(requestContextMiddleware);
app.use(requestLoggerMiddleware);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
function getUploadStaticDir() {
  const uploadDir = process.env.UPLOAD_DIR || "uploads";

  if (path.isAbsolute(uploadDir)) {
    return uploadDir;
  }

  return path.join(process.cwd(), uploadDir);
}

app.use("/uploads", express.static(getUploadStaticDir()));

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "OK",
    data: {
      status: "healthy",
      requestId: req.requestId,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

app.get("/health/live", (req, res) => {
  res.json({
    success: true,
    message: "LIVE",
    data: {
      status: "live",
      requestId: req.requestId,
    },
  });
});

app.get("/health/ready", (req, res) => {
  res.json({
    success: true,
    message: "READY",
    data: {
      status: "ready",
      requestId: req.requestId,
    },
  });
});

app.use("/api/v1", routes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
console.log("PROCESS CWD:", process.cwd());
console.log("UPLOAD STATIC DIR:", getUploadStaticDir());

app.use("/uploads", express.static(getUploadStaticDir()));

export default app;