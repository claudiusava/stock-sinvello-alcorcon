import { OrderItem } from './models/order-item.model';
import { StockProduct } from './models/stock-product.model';

export class InventoryCalculator {
  generateOrder(products: StockProduct[], mesesSeguridad: number): OrderItem[] {
    return products
      .filter((product) => this.needsRestock(product, mesesSeguridad))
      .map((product) => ({
        productId: product.id,
        productName: product.nombre,
        quantity: this.calculateOrderQuantity(product, mesesSeguridad),
        unit: product.unidad,
      }));
  }

  private needsRestock(product: StockProduct, mesesSeguridad: number): boolean {
    return product.stock < this.getMinimumStock(product, mesesSeguridad);
  }

  private getMinimumStock(
    product: StockProduct,
    mesesSeguridad: number,
  ): number {
    return product.consumoMensual * mesesSeguridad;
  }

  private getTargetStock(
    product: StockProduct,
    mesesSeguridad: number,
  ): number {
    return product.consumoMensual * (mesesSeguridad + 1);
  }

  private calculateOrderQuantity(
    product: StockProduct,
    mesesSeguridad: number,
  ): number {
    const target = this.getTargetStock(product, mesesSeguridad);

    return Math.ceil(Math.max(target - product.stock, 0));
  }
}
