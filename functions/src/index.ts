import { onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as logger from 'firebase-functions/logger';

import { FirestoreService } from './firestore.service';
import { InventoryCalculator } from './inventory-calculator';
import {
  TelegramService,
  telegramBotToken,
  telegramChatId,
} from './telegram.service';
import { OrderFormatter } from './order-formatter';

export const generateMonthlyOrder = onSchedule(
  {
    schedule: '0 9 28-31 * *',
    timeZone: 'Europe/Madrid',
    secrets: [telegramBotToken, telegramChatId],
  },
  async () => {
    const firestore = new FirestoreService();

    const products = await firestore.getProducts();

    const settings = await firestore.getSettings();

    const calculator = new InventoryCalculator();

    const order = calculator.generateOrder(products, settings.mesesSeguridad);

    logger.info(order);

    // De momento seguimos sin enviar Telegram.
    // Lo activaremos cuando comprobemos el formato del mensaje.
  },
);

export const testGenerateMonthlyOrder = onRequest(
  {
    secrets: [telegramBotToken, telegramChatId],
  },
  async (request, response) => {
    const firestore = new FirestoreService();

    const products = await firestore.getProducts();

    const settings = await firestore.getSettings();

    const calculator = new InventoryCalculator();

    const order = calculator.generateOrder(products, settings.mesesSeguridad);

    logger.info(order);

    const formatter = new OrderFormatter();

    const message = formatter.format(order);

    const telegram = new TelegramService();

    await telegram.sendMessage(message);

    response.send('Mensaje enviado');
  },
);
