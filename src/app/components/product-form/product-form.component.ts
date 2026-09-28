import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { StockService } from '../../services/stock.service';
import { StockProduct } from '../../models/stock-product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormComponent implements AfterViewInit {
  readonly cancel = output<void>();
  readonly saved = output<void>();
  readonly product = input<StockProduct | null>(null);
  private readonly stockService = inject(StockService);
  private readonly fb = inject(FormBuilder);
  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    unidad: ['', Validators.required],
    stock: [0, [Validators.required, Validators.min(0)]],
  });

  @ViewChild('nombreInput')
  private readonly nombreInput?: ElementRef<HTMLInputElement>;

  readonly previewUrl = signal<string | null>(null);
  private selectedFile: File | null = null;

  constructor() {
    effect(() => {
      const product = this.product();

      if (!product) {
        return;
      }

      this.form.patchValue({
        nombre: product.nombre,
        unidad: product.unidad,
        stock: product.stock,
      });

      this.previewUrl.set(product.imagenUrl ?? `icons/${product.id}.png`);
    });
  }

  get isEditMode(): boolean {
    return this.product() !== null;
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (!file) {
      return;
    }

    this.selectedFile = file;
    this.previewUrl.set(URL.createObjectURL(file));
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      return;
    }

    try {
      if (this.isEditMode) {
        await this.stockService.updateProduct(
          this.product()!.id,
          this.form.getRawValue(),
          this.selectedFile ?? undefined,
        );
      } else {
        await this.stockService.createProduct(
          this.form.getRawValue(),
          this.selectedFile ?? undefined,
        );
      }

      this.saved.emit();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Ha ocurrido un error.');
    }
  }

  ngAfterViewInit(): void {
    this.nombreInput?.nativeElement.focus();
  }
}
