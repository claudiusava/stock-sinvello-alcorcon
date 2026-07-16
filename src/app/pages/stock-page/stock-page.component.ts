import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HostListener, signal } from '@angular/core';
import { StockProductRowComponent } from '../../components/stock-product-row/stock-product-row.component';
import { StockService } from '../../services/stock.service';
import { AdminModalComponent } from '../../components/admin-modal/admin-modal.component';
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

  readonly products$ = this.stockService.products$;

  increase(productId: string): void {
    void this.stockService.changeStock(productId, 1);
  }

  decrease(productId: string): void {
    void this.stockService.changeStock(productId, -1);
  }

  readonly adminOpen = signal(false);

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

  constructor() {
    // this.stockService.seedDatabase();
  }
}
