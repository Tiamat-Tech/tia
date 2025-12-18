import log from "loglevel";
import fs from "fs";
import path from "path";

const LOG_LEVEL = process.env.LOG_LEVEL || "info";
const LOG_FILE = process.env.LOG_FILE;

let fileStream = null;
if (LOG_FILE) {
  const dir = path.dirname(LOG_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fileStream = fs.createWriteStream(LOG_FILE, { flags: "a" });
}

const originalFactory = log.methodFactory;
log.methodFactory = function (methodName, logLevel, loggerName) {
  const rawMethod = originalFactory(methodName, logLevel, loggerName);
  return function (...args) {
    rawMethod(...args);
    if (fileStream) {
      const line = `[${new Date().toISOString()}] ${methodName.toUpperCase()} ${args
        .map((a) => (typeof a === "string" ? a : JSON.stringify(a)))
        .join(" ")}\n`;
      try {
        fileStream.write(line);
      } catch {
        // swallow file write errors to avoid loops
      }
    }
  };
};

log.setLevel(LOG_LEVEL);

export default log;
