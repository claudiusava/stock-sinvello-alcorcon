import {
  ChangeDetectionStrategy,
  Component,
  output,
  signal,
} from '@angular/core';

import { AdminMenuComponent } from '../admin-menu/admin-menu.component';
import { ProductFormComponent } from '../product-form/product-form.component';
import { ManageProductsComponent } from '../manage-products/manage-products.component';

type AdminView =
  | 'menu'
  | 'product-form'
  | 'manage-products';

@Component({
  selector: 'app-admin-modal',
  standalone: true,
  imports: [
    AdminMenuComponent,
    ProductFormComponent,
    ManageProductsComponent,
  ],
  templateUrl: './admin-modal.component.html',
  styleUrl: './admin-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminModalComponent {
  readonly close = output<void>();

  readonly view = signal<AdminView>('menu');

  openCreateProduct(): void {
    this.view.set('product-form');
  }

  openManageProducts(): void {
    this.view.set('manage-products');
  }

  backToMenu(): void {
    this.view.set('menu');
  }
}