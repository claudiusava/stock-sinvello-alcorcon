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
import { getStorage, provideStorage } from '@angular/fire/storage';
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
    provideStorage(() => getStorage()),
    provideAppCheck((injector) => {
      // En local (ng serve) usa un token de depuracion fijo en vez de
      // reCAPTCHA, para no depender del dominio real. Es un valor fijo (no
      // "true") a proposito: con "true" el SDK genera uno aleatorio nuevo en
      // cada arranque y hay que volver a registrarlo siempre en Firebase
      // Console > App Check > tokens de depuracion. Con un valor fijo, se
      // registra una unica vez y sirve para siempre, en cualquier maquina.
      if (isDevMode()) {
        (self as unknown as Record<string, unknown>)[
          'FIREBASE_APPCHECK_DEBUG_TOKEN'
        ] = '1f62a6be-0f7f-4228-b3b5-2348d5e017b4';
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