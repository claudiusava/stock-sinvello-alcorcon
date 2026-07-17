import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
} from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { StockService } from '../../services/stock.service';
import { StockProduct } from '../../models/stock-product.model';
import { ToggleComponent } from '../toggle/toggle.component';

@Component({
  selector: 'app-manage-products',
  standalone: true,
  imports: [AsyncPipe, ToggleComponent],
  templateUrl: './manage-products.component.html',
  styleUrl: './manage-products.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageProductsComponent {
  readonly back = output<void>();
  private readonly stockService = inject(StockService);
  readonly products$ = this.stockService.products$;
  readonly editProduct = output<StockProduct>();

  async toggleProduct(productId: string, activo: boolean): Promise<void> {
    await this.stockService.updateProductStatus(productId, !activo);
  }

  edit(product: StockProduct): void {
    this.editProduct.emit(product);
  }
}
