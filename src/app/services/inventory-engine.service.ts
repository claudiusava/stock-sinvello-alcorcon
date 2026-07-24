import { Injectable } from '@angular/core';

import { StockProduct } from '../models/stock-product.model';

@Injectable({
  providedIn: 'root',
})
export class InventoryEngineService {
  getMinimumStock(product: StockProduct, mesesSeguridad: number): number {
    return product.consumoMensual * mesesSeguridad;
  }

  getTargetStock(product: StockProduct, mesesSeguridad: number): number {
    return product.consumoMensual * (mesesSeguridad + 1);
  }

  needsRestock(product: StockProduct, mesesSeguridad: number): boolean {
    return product.stock < this.getMinimumStock(product, mesesSeguridad);
  }

  calculateOrderQuantity(
    product: StockProduct,
    mesesSeguridad: number,
  ): number {
    const target = this.getTargetStock(product, mesesSeguridad);

    return Math.max(target - product.stock, 0);
  }
}
