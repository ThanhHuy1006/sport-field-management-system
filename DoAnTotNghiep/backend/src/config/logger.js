import { env } from "./env.js";

const isDev = process.env.NODE_ENV !== "production";

function safeStringify(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function writeLog(level, message, meta = null) {
  const time = new Date().toISOString();

  const payload = {
    time,
    level,
    message,
    ...(meta ? { meta } : {}),
  };

  const line = safeStringify(payload);

  switch (level) {
    case "error":
      console.error(line);
      break;
    case "warn":
      console.warn(line);
      break;
    default:
      console.log(line);
      break;
  }
}

export const logger = {
  info(message, meta = null) {
    writeLog("info", message, meta);
  },

  warn(message, meta = null) {
    writeLog("warn", message, meta);
  },

  error(message, meta = null) {
    writeLog("error", message, meta);
  },

  debug(message, meta = null) {
    if (isDev) {
      writeLog("debug", message, meta);
    }
  },

  http(message, meta = null) {
    writeLog("http", message, meta);
  },
};

export default logger;