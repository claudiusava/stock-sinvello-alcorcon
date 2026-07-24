import { FieldValue } from '@angular/fire/firestore';

export interface StockMovement {
  productId: string;
  quantity: number;
  year: number;
  month: number;
  createdAt: FieldValue;
}