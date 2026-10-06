import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  computed,
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
  readonly saveError = output<string>();
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

  // Foto recien elegida en este formulario, si la hay; si no, se muestra la
  // del producto actual (o el icono generico). Como computed derivado en vez
  // de escrito dentro del effect de abajo: escribir una signal dentro de un
  // effect esta prohibido por defecto en Angular y rompia el formulario de
  // edicion (NG0600) sin dar ningun error visible al usuario.
  private readonly manualPreview = signal<string | null>(null);
  readonly previewUrl = computed(() => {
    const manual = this.manualPreview();

    if (manual) {
      return manual;
    }

    const product = this.product();

    return product ? (product.imagenUrl ?? `icons/${product.id}.webp`) : null;
  });

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
    this.manualPreview.set(URL.createObjectURL(file));
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
      this.saveError.emit(
        error instanceof Error ? error.message : 'Ha ocurrido un error.',
      );
    }
  }

  ngAfterViewInit(): void {
    this.nombreInput?.nativeElement.focus();
  }
}
