import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';

import { AdminModalComponent } from '../../components/admin-modal/admin-modal.component';
import { StockProductRowComponent } from '../../components/stock-product-row/stock-product-row.component';
import { StockMovementService } from '../../services/stock-movement.service';
import { StockService } from '../../services/stock.service';

@Component({
  selector: 'app-stock-page',
  standalone: true,
  imports: [AsyncPipe, StockProductRowComponent, AdminModalComponent],
  templateUrl: './stock-page.component.html',
  styleUrl: './stock-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockPageComponent {
  private readonly stockService = inject(StockService);
  private readonly stockMovementService = inject(StockMovementService);

  readonly products$ = this.stockService.activeProducts$;

  readonly todayMovements$ =
    this.stockMovementService.getTodayMovements();

  readonly adminOpen = signal(false);

  increase(productId: string): void {
    void this.stockService.changeStock(productId, 1);
  }

  decrease(productId: string): void {
    void this.stockService.changeStock(productId, -1);
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'a') {
      event.preventDefault();

      this.adminOpen.set(true);
    }
  }

  closeAdmin(): void {
    this.adminOpen.set(false);
  }
}