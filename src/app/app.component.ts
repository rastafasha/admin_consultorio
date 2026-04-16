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
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.pipe(
        // Filtramos para que SOLO responda cuando la versión esté lista
        filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
      ).subscribe(() => {
        if (confirm('Nueva versión disponible. ¿Cargar nueva versión?')) {
          // Recarga la página para activar la nueva versión
          window.location.reload();
        }
      });
    }
  }
  
}
