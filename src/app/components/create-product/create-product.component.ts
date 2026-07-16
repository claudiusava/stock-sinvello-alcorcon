import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { StockService } from '../../services/stock.service';

@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-product.component.html',
  styleUrl: './create-product.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateProductComponent {
  readonly cancel = output<void>();

  readonly saved = output<void>();

  private readonly stockService = inject(StockService);

  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    emoji: ['', Validators.required],
    unidad: ['', Validators.required],
    stock: [0, [Validators.required, Validators.min(0)]],
  });

  async save(): Promise<void> {
    if (this.form.invalid) {
      return;
    }

    try {
      await this.stockService.createProduct(this.form.getRawValue());

      this.saved.emit();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Ha ocurrido un error.');
    }
  }
}
