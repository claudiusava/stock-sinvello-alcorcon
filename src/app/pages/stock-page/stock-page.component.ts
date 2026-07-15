import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { StockProductRowComponent } from '../../components/stock-product-row/stock-product-row.component';
import { StockService } from '../../services/stock.service';

@Component({
  selector: 'app-stock-page',
  standalone: true,
  imports: [AsyncPipe, StockProductRowComponent],
  templateUrl: './stock-page.component.html',
  styleUrl: './stock-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockPageComponent {
  private readonly stockService = inject(StockService);

  readonly products$ = this.stockService.products$;

  increase(productId: string): void {
    void this.stockService.changeStock(productId, 1);
  }

  decrease(productId: string): void {
    void this.stockService.changeStock(productId, -1);
  }

  constructor() {
  // this.stockService.seedDatabase();
}
}
