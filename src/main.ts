alert('Inicio de main.ts');

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

alert('Antes de bootstrap');

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    alert('Bootstrap completado');
  })
  .catch((err) => {
    alert(`Error: ${err}`);
    console.error(err);
  });