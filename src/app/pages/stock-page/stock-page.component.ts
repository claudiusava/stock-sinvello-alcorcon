import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, HostListener, inject, signal } from '@angular/core';
import { combineLatest, map } from 'rxjs';

import { AdminModalComponent } from '../../components/admin-modal/admin-modal.component';
import { StockProductRowComponent } from '../../components/stock-product-row/stock-product-row.component';
import { StockMovementService } from '../../services/stock-movement.service';
import { StockService } from '../../services/stock.service';
import { ToastMessage } from '../../models/toast-message.model';

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

  readonly viewModel$ = combineLatest([
    this.stockService.activeProducts$,
    this.stockMovementService.getTodayMovements(),
  ]).pipe(map(([products, todayMovements]) => ({ products, todayMovements })));

  readonly loadingTimedOut = signal(false);

  constructor() {
    const loadingTimeout = setTimeout(() => this.loadingTimedOut.set(true), 30000);

    inject(DestroyRef).onDestroy(() => clearTimeout(loadingTimeout));
  }

  readonly adminOpen = signal(false);
  readonly toastMessage = signal<ToastMessage | null>(null);
  private toastTimeout?: ReturnType<typeof setTimeout>;

  showToast(toast: ToastMessage): void {
    clearTimeout(this.toastTimeout);
    this.toastMessage.set(toast);
    this.toastTimeout = setTimeout(() => this.toastMessage.set(null), 3000);
  }

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