import { Injectable, inject } from '@angular/core';
import {
  CollectionReference,
  Firestore,
  collection,
  collectionData,
  query,
  where,
} from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';

import { StockMovement } from '../models/stock-movement.model';
import { TodayStockMovement } from '../models/today-stock-movement.model';

@Injectable({
  providedIn: 'root',
})
export class StockMovementService {
  private readonly firestore = inject(Firestore);

  private readonly movementsCollection = collection(
    this.firestore,
    'stockMovements',
  ) as CollectionReference<StockMovement>;

  getTodayMovements(): Observable<Record<string, TodayStockMovement>> {
    const startOfDay = new Date();

    startOfDay.setHours(0, 0, 0, 0);

    return collectionData(
      query(
        this.movementsCollection,
        where('createdAt', '>=', startOfDay),
      ),
    ).pipe(
      map((movements) => {
        const result: Record<string, TodayStockMovement> = {};

        for (const movement of movements) {
          if (!result[movement.productId]) {
            result[movement.productId] = {
              consumed: 0,
              added: 0,
            };
          }

          if (movement.quantity < 0) {
            result[movement.productId].consumed += Math.abs(
              movement.quantity,
            );
          } else {
            result[movement.productId].added += movement.quantity;
          }
        }

        return result;
      }),
    );
  }
}