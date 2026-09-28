import { Injectable, inject } from '@angular/core';
import {
  CollectionReference,
  Firestore,
  collection,
  collectionData,
  doc,
  getDoc,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { StockProduct } from '../models/stock-product.model';
import { ProductForm } from '../models/product-form.model';
import { StockMovement } from '../models/stock-movement.model';

@Injectable({
  providedIn: 'root',
})
export class StockService {
  private readonly firestore = inject(Firestore);
  private readonly storage = inject(Storage);
  private readonly productsCollection = collection(
    this.firestore,
    'products',
  ) as CollectionReference<StockProduct>;

  readonly products$: Observable<StockProduct[]> = collectionData(
    query(this.productsCollection, orderBy('nombre')),
    { idField: 'id' },
  );

  getProducts(): Observable<StockProduct[]> {
    return this.products$;
  }

  readonly activeProducts$: Observable<StockProduct[]> = collectionData(
    query(
      this.productsCollection,
      where('activo', '==', true),
      orderBy('nombre'),
    ),
    { idField: 'id' },
  );

  async changeStock(productId: string, amount: 1 | -1): Promise<void> {
    const productRef = doc(this.firestore, 'products', productId);

    await runTransaction(this.firestore, async (transaction) => {
      const productSnapshot = await transaction.get(productRef);

      const currentStock = productSnapshot.data()?.['stock'] ?? 0;

      const newStock = currentStock + amount;

      if (newStock < 0) {
        return;
      }

      transaction.update(productRef, { stock: newStock });

      const movementRef = doc(collection(this.firestore, 'stockMovements'));

      const now = new Date();

      const movement: StockMovement = {
        productId,
        quantity: amount,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        createdAt: serverTimestamp() as never,
      };

      transaction.set(movementRef, movement);
    });
  }

  async createProduct(product: ProductForm, imageFile?: File): Promise<void> {
    const id = this.createProductId(product.nombre);

    const productRef = doc(this.firestore, 'products', id);

    const snapshot = await getDoc(productRef);

    if (snapshot.exists()) {
      throw new Error('Ya existe un producto con ese nombre.');
    }

    const imagenUrl = imageFile
      ? await this.uploadProductImage(id, imageFile)
      : undefined;

    await setDoc(productRef, {
      nombre: product.nombre,
      unidad: product.unidad,
      stock: product.stock,
      activo: true,
      consumoMensual: 0,
      ...(imagenUrl ? { imagenUrl } : {}),
    });
  }

  async updateProduct(
    productId: string,
    product: ProductForm,
    imageFile?: File,
  ): Promise<void> {
    const imagenUrl = imageFile
      ? await this.uploadProductImage(productId, imageFile)
      : undefined;

    await updateDoc(doc(this.firestore, 'products', productId), {
      nombre: product.nombre,
      unidad: product.unidad,
      stock: product.stock,
      ...(imagenUrl ? { imagenUrl } : {}),
    });
  }

  // Se reescala en el propio dispositivo antes de subir para no mandar fotos
  // de varios MB directas de la camara a Storage.
  private async uploadProductImage(
    productId: string,
    file: File,
  ): Promise<string> {
    const resized = await this.resizeImage(file);
    const imageRef = ref(this.storage, `products/${productId}`);

    await uploadBytes(imageRef, resized, { contentType: 'image/jpeg' });

    return getDownloadURL(imageRef);
  }

  private async resizeImage(
    file: File,
    maxSize = 800,
    quality = 0.82,
  ): Promise<Blob> {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height);

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error('No se pudo procesar la imagen.')),
        'image/jpeg',
        quality,
      );
    });
  }

  private createProductId(nombre: string): string {
    return nombre
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async updateProductStatus(productId: string, activo: boolean): Promise<void> {
    await updateDoc(doc(this.firestore, 'products', productId), {
      activo,
    });
  }
}
