import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as logger from 'firebase-functions/logger';
import { FirestoreService } from './firestore.service';
import { onRequest } from 'firebase-functions/v2/https';
import { InventoryCalculator } from './inventory-calculator';

export const generateMonthlyOrder = onSchedule(
  {
    schedule: '0 9 28-31 * *',
    timeZone: 'Europe/Madrid',
  },
  async () => {
    const firestore = new FirestoreService();

    const products = await firestore.getProducts();

    logger.info(products);
  },
);

export const testGenerateMonthlyOrder = onRequest(async (request, response) => {
  const firestore = new FirestoreService();

  const products = await firestore.getProducts();

  const settings = await firestore.getSettings();

  const calculator = new InventoryCalculator();

  const order = calculator.generateOrder(products, settings.mesesSeguridad);

  response.json(order);
});
