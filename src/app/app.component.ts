import { Component, OnInit } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent {
  title = 'klyntic_consultorio_admin';

  constructor(private swUpdate: SwUpdate){}

  ngOnInit() {
   // =========================================================================
    // 🟢 LOGS DE SEGUIMIENTO PARA EL SERVICE WORKER EN EL RAÍZ
    // =========================================================================
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.subscribe((evt) => {
        switch (evt.type) {
          case 'VERSION_DETECTED':
            console.log('SW: Se está descargando una nueva versión...', evt.version.hash);
            break;
            
          case 'VERSION_READY':
            // 🟢 SOLUCIÓN: Eliminamos el alert confirm() molesto. 
            // Ahora dejamos que tu componente 'pwa-notif-installer' maneje el modal estético de forma exclusiva.
            console.log('SW: Nueva versión lista en el servidor:', evt.latestVersion.hash);
            break;

          case 'VERSION_INSTALLATION_FAILED':
            console.error('SW: Falló la instalación:', evt.error);
            break;
        }
      });

      this.swUpdate.checkForUpdate().then(hasUpdate => {
        if (hasUpdate) console.log('SW: Cambios detectados en el servidor.');
      }).catch(err => {
        console.error('SW: Error al verificar actualizaciones:', err);
      });
    }
  }
  
}
