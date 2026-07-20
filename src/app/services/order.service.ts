import { Injectable, inject } from '@angular/core';

import { InventoryEngineService } from './inventory-engine.service';
import { InventorySettingsService } from './inventory-settings.service';
import { StockService } from './stock.service';

import { combineLatest, map, Observable } from 'rxjs';

import { Order } from '../models/order.model';


import {
  CollectionReference,
  Firestore,
  addDoc,
  collection,
  serverTimestamp,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly stockService = inject(StockService);
  private readonly settingsService = inject(InventorySettingsService);
  private readonly inventoryEngine = inject(InventoryEngineService);
  private readonly firestore = inject(Firestore);
  private readonly ordersCollection = collection(
    this.firestore,
    'orders',
  ) as CollectionReference<Order>;

  generateOrder(): Observable<Order> {
    return combineLatest([
      this.stockService.products$,
      this.settingsService.getSettings(),
    ]).pipe(
      map(([products, settings]) => {
        const items = products
          .filter((product) =>
            this.inventoryEngine.needsRestock(product, settings.mesesSeguridad),
          )
          .map((product) => ({
            productId: product.id,
            productName: product.nombre,
            quantity: this.inventoryEngine.calculateOrderQuantity(
              product,
              settings.mesesSeguridad,
            ),
            unit: product.unidad,
            lotType: product.tipoLote,
          }));

        return {
          items,
        };
      }),
    );
  }

  async createOrder(order: Order): Promise<void> {
    await addDoc(this.ordersCollection, {
      ...order,
      createdAt: serverTimestamp(),
    });
  }
}
