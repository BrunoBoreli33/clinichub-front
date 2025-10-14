export const timeNow = () => new Date().toISOString();

export const logInfo = (message: string, context?: any) => {
  try {
    console.info(`[INFO] [${timeNow()}] ${message}`, context ?? "");
  } catch (e) {
    // noop
  }
};

export const logWarn = (message: string, context?: any) => {
  try {
    console.warn(`[WARN] [${timeNow()}] ${message}`, context ?? "");
  } catch (e) {
    // noop
  }
};

export const logError = (message: string, context?: any) => {
  try {
    console.error(`[ERROR] [${timeNow()}] ${message}`, context ?? "");
  } catch (e) {
    // noop
  }
};

export default {
  timeNow,
  logInfo,
  logWarn,
  logError,
};
