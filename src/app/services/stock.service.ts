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
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { StockProduct } from '../models/stock-product.model';
import { setDoc } from '@angular/fire/firestore';


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

  changeStock(productId: string, amount: 1 | -1): Promise<void> {
    const productRef = doc(this.productsCollection, productId);

    return updateDoc(productRef, {
      stock: increment(amount),
    });
  }

  async seedDatabase(): Promise<void> {
  for (const product of INITIAL_PRODUCTS) {
    const { id, ...data } = product;

    await setDoc(
      doc(this.firestore, 'products', id),
      data
    );
  }

  console.log('Base de datos inicializada');
}

}
