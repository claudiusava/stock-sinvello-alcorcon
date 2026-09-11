import { onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";

import { FirestoreService } from "./firestore.service";
import { InventoryCalculator } from "./inventory-calculator";
import { OrderFormatter } from "./order-formatter";
import {
  TelegramService,
  telegramBotToken,
  telegramChatId,
} from "./telegram.service";

async function generateOrderMessage(): Promise<string> {
  const firestore = new FirestoreService();

  const products = await firestore.getProducts();
  const settings = await firestore.getSettings();

  const calculator = new InventoryCalculator();
  const order = calculator.generateOrder(
    products,
    settings.mesesSeguridad,
  );

  logger.info(order);

  const formatter = new OrderFormatter();

  return formatter.format(order);
}

export const refreshMonthlyConsumption = onSchedule(
  {
    schedule: "0 2 * * *",
    timeZone: "Europe/Madrid",
  },
  async () => {
    const firestore = new FirestoreService();

    await firestore.refreshMonthlyConsumption();
  },
);

export const generateMonthlyOrder = onSchedule(
  {
    schedule: "0 9 * * *",
    timeZone: "Europe/Madrid",
    secrets: [telegramBotToken, telegramChatId],
  },
  async () => {
    const now = new Date();

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    const isLastDayOfMonth =
      tomorrow.getMonth() !== now.getMonth();

    if (!isLastDayOfMonth) {
      logger.info("No es el último día del mes. No se genera pedido.");
      return;
    }

    const message = await generateOrderMessage();

    const telegram = new TelegramService();

    await telegram.sendMessage(message);
  },
);

export const testGenerateMonthlyOrder = onRequest(
  {
    secrets: [telegramBotToken, telegramChatId],
  },
  async (request, response) => {
    const message = await generateOrderMessage();

    const telegram = new TelegramService();

    await telegram.sendMessage(message);

    response.send("Mensaje enviado");
  },
);