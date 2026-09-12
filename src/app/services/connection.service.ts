import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {

  // Inicializa con el estado actual del navegador
  private isOnline$ = new BehaviorSubject<boolean>(navigator.onLine);

  constructor() {
    // Escucha los eventos globales de conectividad
    merge(
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false))
    ).subscribe(status => {
      this.isOnline$.next(status);
    });
  }

  // Permite suscribirse para reaccionar a los cambios de red en tiempo real
  checkStatus(): Observable<boolean> {
    return this.isOnline$.asObservable();
  }

  // Método síncrono rápido para validaciones instantáneas
  get currentStatus(): boolean {
    return this.isOnline$.value;
  }
}
