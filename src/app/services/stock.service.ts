import { Injectable, inject } from '@angular/core';
import {
  CollectionReference,
  Firestore,
  collection,
  collectionData,
  doc,
  getDoc,
  increment,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { StockProduct } from '../models/stock-product.model';
import { ProductForm } from '../models/product-form.model';
import { StockMovement } from '../models/stock-movement.model';

@Injectable({
  providedIn: 'root',
})
export class StockService {
  private readonly firestore = inject(Firestore);
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
    const batch = writeBatch(this.firestore);

    const productRef = doc(this.firestore, 'products', productId);

    batch.update(productRef, {
      stock: increment(amount),
    });

    const movementRef = doc(collection(this.firestore, 'stockMovements'));

    const now = new Date();

    const movement: StockMovement = {
      productId,
      quantity: amount,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      createdAt: serverTimestamp(),
    };

    batch.set(movementRef, movement);

    await batch.commit();
  }

  async createProduct(product: ProductForm): Promise<void> {
    const id = this.createProductId(product.nombre);

    const productRef = doc(this.firestore, 'products', id);

    const snapshot = await getDoc(productRef);

    if (snapshot.exists()) {
      throw new Error('Ya existe un producto con ese nombre.');
    }

    await setDoc(productRef, {
      ...product,
      activo: true,
      consumoMensual: 0,
    });
  }

  async updateProduct(productId: string, product: ProductForm): Promise<void> {
    await updateDoc(doc(this.firestore, 'products', productId), {
      nombre: product.nombre,
      emoji: product.emoji,
      unidad: product.unidad,
      stock: product.stock,
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
