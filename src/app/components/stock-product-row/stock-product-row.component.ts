import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { StockProduct } from '../../models/stock-product.model';

@Component({
  selector: 'app-stock-product-row',
  standalone: true,
  templateUrl: './stock-product-row.component.html',
  styleUrl: './stock-product-row.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockProductRowComponent {
  @Input({ required: true }) product!: StockProduct;

  @Output() increase = new EventEmitter<string>();
  @Output() decrease = new EventEmitter<string>();
}
