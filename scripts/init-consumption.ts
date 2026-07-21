import { initializeApp } from 'firebase/app';
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  updateDoc,
} from 'firebase/firestore';

import { environment } from '../src/environments/environment';

const app = initializeApp(environment.firebase);
const db = getFirestore(app);

const consumos: Record<string, number> = {
  alcohol: 0.6,

  'aloe-250': 6.1,
  'aloe-500': 7.4,
  'aloe-vera-5l': 0.4,

  'bolsa-basura-30l': 0,
  'bolsa-basura-50l': 0,

  depresores: 3.3,

  gafas: 12,

  'gel-conductor': 5.9,

  guantes: 3.8,

  'leche-regeneradora': 2,

  oxvirin: 1.1,

  'papel-camilla': 2.7,

  'papel-higienico': 0,

  'papel-secamanos': 8.5,

  rasuradoras: 3.1,

  'tangas-hombre': 0.3,

  'tangas-mujer': 1.5,
};

async function run() {
  const snapshot = await getDocs(collection(db, 'products'));

  for (const product of snapshot.docs) {
    const consumo = consumos[product.id];

    if (consumo === undefined) {
      console.warn(`⚠️ ${product.id}: sin consumo definido`);
      continue;
    }

    await updateDoc(doc(db, 'products', product.id), {
      consumoMensual: consumo,
    });

    console.log(`✅ ${product.id} → ${consumo}`);
  }

  console.log('🎉 Consumos inicializados correctamente');
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });