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
    query(this.productsCollection, orderBy('orden')),
    { idField: 'id' },
  );

  changeStock(productId: string, amount: 1 | -1): Promise<void> {
    const productRef = doc(this.productsCollection, productId);

    return updateDoc(productRef, {
      stock: increment(amount),
    });
  }

  async seedDatabase(): Promise<void> {
  for (const product of this.initialProducts) {
    const { id, ...data } = product;

    await setDoc(
      doc(this.firestore, 'products', id),
      data
    );
  }

  console.log('Base de datos inicializada');
}

  private readonly initialProducts = [
  { id: 'rasuradoras', nombre: 'Rasuradoras', stock: 15, unidad: 'cajas', orden: 1 },
  { id: 'gel-conductor', nombre: 'Gel conductor', stock: 7, unidad: 'garrafas de 5L', orden: 2 },
  { id: 'papel-camilla', nombre: 'Papel camilla', stock: 10, unidad: 'rollos', orden: 3 },
  { id: 'papel-secamanos', nombre: 'Papel secamanos', stock: 2, unidad: 'rollos', orden: 4 },
  { id: 'aloe-500', nombre: 'Aloe Vera 500 ml', stock: 12, unidad: 'botes', orden: 5 },
  { id: 'aloe-250', nombre: 'Aloe Vera 250 ml', stock: 6, unidad: 'botes', orden: 6 },
  { id: 'oxvirin', nombre: 'Oxvirin', stock: 2, unidad: 'botes', orden: 7 },
  { id: 'alcohol', nombre: 'Alcohol', stock: 1, unidad: 'botes', orden: 8 },
  { id: 'guantes', nombre: 'Guantes', stock: 8, unidad: 'cajas', orden: 9 },
  { id: 'tangas-mujer', nombre: 'Tangas mujer', stock: 5, unidad: 'cajas', orden: 10 },
  { id: 'tangas-hombre', nombre: 'Tangas hombre', stock: 3, unidad: 'cajas', orden: 11 },
  { id: 'depresores', nombre: 'Depresores', stock: 7, unidad: 'cajas', orden: 12 },
];
}
