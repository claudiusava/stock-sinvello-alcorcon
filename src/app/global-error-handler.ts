import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    const pre = document.createElement('pre');

    pre.style.position = 'fixed';
    pre.style.inset = '0';
    pre.style.margin = '0';
    pre.style.padding = '16px';
    pre.style.background = '#fff';
    pre.style.color = '#c00';
    pre.style.fontSize = '14px';
    pre.style.whiteSpace = 'pre-wrap';
    pre.style.overflow = 'auto';
    pre.style.zIndex = '999999';

    pre.textContent =
      error instanceof Error
        ? `${error.name}\n\n${error.message}\n\n${error.stack ?? ''}`
        : String(error);

    document.body.innerHTML = '';
    document.body.appendChild(pre);

    console.error(error);
  }
}