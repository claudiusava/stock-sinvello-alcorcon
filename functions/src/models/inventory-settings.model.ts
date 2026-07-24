import { Timestamp } from "firebase-admin/firestore";

export interface InventorySettings {
  mesesSeguridad: number;
  startDate: Timestamp;
}