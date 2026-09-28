import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
  signal,
} from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { StockService } from '../../services/stock.service';
import { StockProduct } from '../../models/stock-product.model';
import { ToggleComponent } from '../toggle/toggle.component';

const DELETE_COUNTDOWN_SECONDS = 5;

// El boton de eliminar (y este flujo de confirmacion) esta implementado
// pero oculto en la plantilla: firestore.rules exige App Check valido
// para borrar (request.app != null), y en la consola de Firebase
// (App Check > APIs > Cloud Firestore) solo el 62% del trafico sale como
// verificado ahora mismo. Activar "Aplicar" con ese ratio arriesgaria a
// romper la app en la tablet real. Cuando se confirme que ese porcentaje
// sube de forma estable, se reactiva el boton en el HTML.

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
  readonly deleted = output<void>();
  readonly deleteError = output<string>();

  readonly confirmingDelete = signal<StockProduct | null>(null);
  readonly deleteCountdown = signal(0);
  private countdownInterval?: ReturnType<typeof setInterval>;

  async toggleProduct(productId: string, activo: boolean): Promise<void> {
    await this.stockService.updateProductStatus(productId, !activo);
  }

  edit(product: StockProduct): void {
    this.editProduct.emit(product);
  }

  askDelete(product: StockProduct): void {
    this.confirmingDelete.set(product);
    this.deleteCountdown.set(DELETE_COUNTDOWN_SECONDS);

    clearInterval(this.countdownInterval);
    this.countdownInterval = setInterval(() => {
      const remaining = this.deleteCountdown() - 1;
      this.deleteCountdown.set(Math.max(0, remaining));

      if (remaining <= 0) {
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  cancelDelete(): void {
    clearInterval(this.countdownInterval);
    this.confirmingDelete.set(null);
  }

  async confirmDelete(): Promise<void> {
    const product = this.confirmingDelete();

    if (!product || this.deleteCountdown() > 0) {
      return;
    }

    clearInterval(this.countdownInterval);
    this.confirmingDelete.set(null);

    try {
      await this.stockService.deleteProduct(product.id);
      this.deleted.emit();
    } catch (error) {
      this.deleteError.emit(
        error instanceof Error ? error.message : 'No se pudo eliminar el producto.',
      );
    }
  }
}
