import {
  ChangeDetectionStrategy,
  Component,
  output,
  signal,
} from '@angular/core';
import { AdminMenuComponent } from '../admin-menu/admin-menu.component';
import { ProductFormComponent } from '../product-form/product-form.component';
import { ManageProductsComponent } from '../manage-products/manage-products.component';
import { StockProduct } from '../../models/stock-product.model';
import { ToastMessage } from '../../models/toast-message.model';

type AdminView = 'menu' | 'product-form' | 'manage-products';

@Component({
  selector: 'app-admin-modal',
  standalone: true,
  imports: [AdminMenuComponent, ProductFormComponent, ManageProductsComponent],
  templateUrl: './admin-modal.component.html',
  styleUrl: './admin-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminModalComponent {
  readonly close = output<void>();
  readonly feedback = output<ToastMessage>();
  readonly view = signal<AdminView>('menu');
  readonly selectedProduct = signal<StockProduct | null>(null);

  openCreateProduct(): void {
    this.selectedProduct.set(null);
    this.view.set('product-form');
  }

  openManageProducts(): void {
    this.view.set('manage-products');
  }

  backToMenu(): void {
    this.selectedProduct.set(null);
    this.view.set('menu');
  }

  openEditProduct(product: StockProduct): void {
    this.selectedProduct.set(product);
    this.view.set('product-form');
  }

  cancelProductForm(): void {
    // Si se estaba editando, vuelve a "Gestionar productos" (de donde vino),
    // no al menu principal -- si no, era un alta nueva, y ahi si al menu.
    const wasEditing = this.selectedProduct() !== null;

    this.selectedProduct.set(null);
    this.view.set(wasEditing ? 'manage-products' : 'menu');
  }

  onProductSaved(): void {
    const wasEditing = this.selectedProduct() !== null;

    this.feedback.emit({
      text: wasEditing ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.',
      type: 'success',
    });

    if (wasEditing) {
      // Vuelve al listado de "Gestionar productos" en vez de cerrar todo el
      // panel, para poder editar varios productos seguidos sin tener que
      // volver a abrir el menu cada vez.
      this.selectedProduct.set(null);
      this.view.set('manage-products');
    } else {
      this.close.emit();
    }
  }

  onProductError(message: string): void {
    this.feedback.emit({ text: message, type: 'error' });
  }

  onProductDeleted(): void {
    this.feedback.emit({ text: 'Producto eliminado correctamente.', type: 'success' });
  }
}
