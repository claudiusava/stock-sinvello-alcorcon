import {
  ApplicationConfig,
  ErrorHandler,
  isDevMode,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  initializeAppCheck,
  provideAppCheck,
  ReCaptchaEnterpriseProvider,
} from '@angular/fire/app-check';
import { FirebaseApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideRouter } from '@angular/router';

import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { GlobalErrorHandler } from './global-error-handler';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideAppCheck((injector) => {
      // En local (ng serve) usa un token de depuracion en vez de reCAPTCHA,
      // para no depender del dominio real. Hay que registrar ese token en
      // Firebase Console > App Check > Apps la primera vez que se imprima
      // por consola.
      if (isDevMode()) {
        (self as unknown as Record<string, unknown>)[
          'FIREBASE_APPCHECK_DEBUG_TOKEN'
        ] = true;
      }

      const app = injector.get(FirebaseApp);

      return initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(environment.recaptchaSiteKey),
        isTokenAutoRefreshEnabled: true,
      });
    }),

    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
    },
  ],
};