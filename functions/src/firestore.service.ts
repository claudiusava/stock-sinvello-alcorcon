import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";

import {StockProduct} from "./models/stock-product.model";
import { InventorySettings } from "./models/inventory-settings.model";

initializeApp();

const db = getFirestore();

export class FirestoreService {
  async getProducts(): Promise<StockProduct[]> {
    const snapshot = await db.collection("products").get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as StockProduct[];
  }

  async getSettings(): Promise<InventorySettings> {
  const snapshot = await db
    .collection("inventorySettings")
    .doc("general")
    .get();

  return snapshot.data() as InventorySettings;
}
}

