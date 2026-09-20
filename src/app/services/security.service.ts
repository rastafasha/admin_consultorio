import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment.consultorio'; // Ajusta la ruta a tu environment


@Injectable({
  providedIn: 'root'
})
export class SecurityService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  public disableDeveloperTools(): void {
    // 1. Asegurar que estamos en producción y ejecutándonos en el Navegador (evita errores con SSR)
    if (!environment.production || !isPlatformBrowser(this.platformId)) {
      return;
    }

    // 2. Bloquear clic derecho (Menú Contextual)
    document.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });

    // 3. Bloquear combinaciones de teclado
    document.addEventListener('keydown', (event) => {
      // Bloquear F12
      if (event.key === 'F12') {
        event.preventDefault();
        return;
      }

      // Bloquear Ctrl+Shift+I / Cmd+Alt+I (Inspector)
      // Bloquear Ctrl+Shift+J / Cmd+Alt+J (Consola)
      // Bloquear Ctrl+Shift+C (Selector de elementos)
      // Bloquear Ctrl+U (Ver código fuente)
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;
      const isShiftOrAlt = event.shiftKey || event.altKey;

      if (
        (isCtrlOrCmd && isShiftOrAlt && (event.key === 'I' || event.key === 'i' || event.key === 'J' || event.key === 'j' || event.key === 'C' || event.key === 'c')) ||
        (isCtrlOrCmd && (event.key === 'U' || event.key === 'u'))
      ) {
        event.preventDefault();
      }
    });
  }
}
