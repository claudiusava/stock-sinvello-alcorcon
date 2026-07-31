import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

import { StockProduct } from './models/stock-product.model';
import { InventorySettings } from './models/inventory-settings.model';

initializeApp();

const db = getFirestore();

const ONE_DAY = 24 * 60 * 60 * 1000;
const MAX_DAYS = 365;
const DAYS_PER_MONTH = 30.44;

export class FirestoreService {
  async getProducts(): Promise<StockProduct[]> {
    const snapshot = await db.collection('products').get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as StockProduct[];
  }

  async getSettings(): Promise<InventorySettings> {
    const snapshot = await db
      .collection('inventorySettings')
      .doc('general')
      .get();

    return snapshot.data() as InventorySettings;
  }

  async refreshMonthlyConsumption(): Promise<void> {
    const now = new Date();

    const { startDate } = await this.getSettings();

    const startDateDate = startDate.toDate();

    const elapsedDays = Math.max(
      1,
      Math.floor((now.getTime() - startDateDate.getTime()) / ONE_DAY) + 1,
    );

    if (elapsedDays < 30) {
      return;
    }

    const daysAnalyzed = Math.min(elapsedDays, MAX_DAYS);

    const windowStart = new Date(now.getTime() - (daysAnalyzed - 1) * ONE_DAY);

    const [productsSnapshot, movementsSnapshot] = await Promise.all([
      db.collection('products').get(),
      db
        .collection('stockMovements')
        .where('createdAt', '>=', Timestamp.fromDate(windowStart))
        .get(),
    ]);

    const consumedByProduct = new Map<string, number>();

    for (const movement of movementsSnapshot.docs) {
      const data = movement.data();

      if (data.quantity >= 0) {
        continue;
      }

      consumedByProduct.set(
        data.productId,
        (consumedByProduct.get(data.productId) ?? 0) + Math.abs(data.quantity),
      );
    }

    const batch = db.batch();

    for (const product of productsSnapshot.docs) {
      const totalConsumed = consumedByProduct.get(product.id) ?? 0;

      const consumoMensual = Number(
        ((totalConsumed / daysAnalyzed) * DAYS_PER_MONTH).toFixed(2),
      );

      batch.update(product.ref, {
        consumoMensual,
      });
    }

    await batch.commit();
  }
}
