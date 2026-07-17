import { Injectable, inject } from '@angular/core';
import {
  CollectionReference,
  Firestore,
  collection,
  collectionData,
  doc,
  increment,
  orderBy,
  query,
  updateDoc,
  getDoc,
  where,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { INITIAL_PRODUCTS } from '../data/initial-products';
import { StockProduct } from '../models/stock-product.model';
import { setDoc } from '@angular/fire/firestore';
import { ProductForm } from '../models/product-form.model';

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

  readonly activeProducts$: Observable<StockProduct[]> = collectionData(
    query(
      this.productsCollection,
      where('activo', '==', true),
      orderBy('nombre'),
    ),
    { idField: 'id' },
  );

  changeStock(productId: string, amount: 1 | -1): Promise<void> {
    const productRef = doc(this.productsCollection, productId);

    return updateDoc(productRef, {
      stock: increment(amount),
    });
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
    });
  }

  async updateProduct(
    productId: string,
    product: ProductForm,
  ): Promise<void> {
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

  async seedDatabase(): Promise<void> {
    for (const product of INITIAL_PRODUCTS) {
      const { id, ...data } = product;

      await setDoc(doc(this.firestore, 'products', id), data);
    }

    console.log('Base de datos inicializada');
  }
}
