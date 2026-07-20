import {onSchedule} from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";

export const generateMonthlyOrder = onSchedule(
  {
    schedule: "0 9 28-31 * *",
    timeZone: "Europe/Madrid",
  },
  async () => {
    logger.info("Generando pedido mensual...");
  }
);
