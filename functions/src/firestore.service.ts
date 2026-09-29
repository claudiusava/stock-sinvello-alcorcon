import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

import { StockProduct } from './models/stock-product.model';
import { InventorySettings } from './models/inventory-settings.model';

initializeApp();

const db = getFirestore();

const ONE_DAY = 24 * 60 * 60 * 1000;
const MAX_DAYS = 365;
const MIN_TRACKED_DAYS = 14;
const DAYS_PER_MONTH = 30.44;

// Las trabajadoras no tienen acceso al menu oculto (solo el dueno), asi que
// la unica forma que tienen de corregir un conteo a mano es a base de clics
// en +/- de la pantalla principal. Esto genera rafagas de varios movimientos
// del mismo producto en pocos segundos (a veces el saldo llega a marcar
// numeros negativos, imposible con stock real) que no son consumo real, sino
// una correccion. Un hueco de mas de 2 minutos entre movimientos del mismo
// producto se considera el fin de esa sesion de clics.
const SESSION_GAP_MS = 2 * 60 * 1000;

interface StockMovementRecord {
  quantity: number;
  date: Date;
}

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

    const windowStart = new Date(now.getTime() - (MAX_DAYS - 1) * ONE_DAY);

    const [productsSnapshot, movementsSnapshot] = await Promise.all([
      db.collection('products').get(),
      db
        .collection('stockMovements')
        .where('createdAt', '>=', Timestamp.fromDate(windowStart))
        .get(),
    ]);

    const movementsByProduct = new Map<string, StockMovementRecord[]>();

    for (const movement of movementsSnapshot.docs) {
      const data = movement.data();
      const list = movementsByProduct.get(data.productId) ?? [];

      list.push({
        quantity: data.quantity,
        date: (data.createdAt as Timestamp).toDate(),
      });

      movementsByProduct.set(data.productId, list);
    }

    const batch = db.batch();

    for (const product of productsSnapshot.docs) {
      const movements = movementsByProduct.get(product.id);

      if (!movements || movements.length === 0) {
        continue;
      }

      const genuineConsumptions = this.extractGenuineConsumptions(movements);

      if (genuineConsumptions.length === 0) {
        continue;
      }

      const totalConsumed = genuineConsumptions.reduce(
        (sum, movement) => sum + Math.abs(movement.quantity),
        0,
      );

      const earliestMovement = genuineConsumptions[0].date;

      const daysTracked = Math.max(
        1,
        Math.floor((now.getTime() - earliestMovement.getTime()) / ONE_DAY) + 1,
      );

      if (daysTracked < MIN_TRACKED_DAYS) {
        continue;
      }

      const consumoMensual = Number(
        ((totalConsumed / daysTracked) * DAYS_PER_MONTH).toFixed(2),
      );

      batch.update(product.ref, {
        consumoMensual,
      });
    }

    await batch.commit();
  }

  // Agrupa los movimientos de un producto en "sesiones" de clics segun el
  // hueco de tiempo entre ellos, y se queda solo con las sesiones formadas
  // por un unico movimiento negativo: eso es lo unico que se puede distinguir
  // de forma fiable como "una unidad consumida de verdad" frente a una
  // correccion manual a base de varios clics seguidos (de cualquier signo).
  private extractGenuineConsumptions(
    movements: StockMovementRecord[],
  ): StockMovementRecord[] {
    const sorted = [...movements].sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );

    const sessions: StockMovementRecord[][] = [];

    for (const movement of sorted) {
      const currentSession = sessions[sessions.length - 1];
      const previous = currentSession?.[currentSession.length - 1];

      if (previous && movement.date.getTime() - previous.date.getTime() <= SESSION_GAP_MS) {
        currentSession.push(movement);
      } else {
        sessions.push([movement]);
      }
    }

    return sessions
      .filter((session) => session.length === 1 && session[0].quantity < 0)
      .map((session) => session[0]);
  }
}
