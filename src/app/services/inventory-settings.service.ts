import { Injectable, inject } from '@angular/core';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

import { InventorySettings } from '../models/inventory-settings.model';

@Injectable({
  providedIn: 'root',
})
export class InventorySettingsService {
  private readonly firestore = inject(Firestore);

  getSettings(): Observable<InventorySettings> {
    const settingsRef = doc(
      this.firestore,
      'inventorySettings',
      'general'
    );

    return docData(settingsRef) as Observable<InventorySettings>;
  }
}