import { inject, Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

const claveVapidApi = environment.VAPI_KEY_PUBLIC;

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  readonly VAPID_PUBLIC_KEY = claveVapidApi;
  readonly urlBackedNotification = environment.urlBackedNotification;

  private swPush = inject(SwPush);
  private http = inject(HttpClient);
  public toastr = inject(ToastrService);
  public router = inject(Router);
  // Este observable le dirá a cualquier componente si el usuario está suscrito
  public isSubscribed$ = new BehaviorSubject<boolean>(false);
  public isProcessing$ = new BehaviorSubject<boolean>(false);

   get token():string{
    return localStorage.getItem('token') || '';
  }

  get headers(){
    return{
      headers: {
        'x-token': this.token
      }
    }
  }


  constructor() {
    this.checkSubscriptionStatus();
    this.checkInitialStatus();
  }
  async checkInitialStatus() {
    // Verificamos si el navegador ya tiene una suscripción activa
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    this.isSubscribed$.next(!!sub);
  }
  setSubscriptionStatus(status: boolean) {
    this.isSubscribed$.next(status);
  }
  async checkSubscriptionStatus() {
    // 1. Esperamos a que el Service Worker esté listo
    const reg = await navigator.serviceWorker.ready;
    // 2. Buscamos si ya hay una suscripción
    const sub = await reg.pushManager.getSubscription();
    // 3. Si hay suscripción, avisamos a la App
    this.isSubscribed$.next(!!sub);
  }

  subscribeToNotifications() {
  this.isProcessing$.next(true);
  
  this.swPush.requestSubscription({
    serverPublicKey: this.VAPID_PUBLIC_KEY
  })
  .then(sub => {
    // 1. EXTRAER EL TOKEN
    const miToken = localStorage.getItem('token') || '';

    // 2. CONFIGURAR EL HEADER
    const headers = {
      'x-token': miToken
    };
    
    console.log('Enviando con token:', miToken);

    // 3. HACER EL POST AL BACKEND (Usa tu variable de URL correcta)
    // Cambié urlBackend por el nombre de tu variable real si es necesario
    this.http.post(this.urlBackedNotification, sub, { headers }).subscribe({
      next: () => {
        console.log('✅ ¡Suscripción guardada con éxito!');
        this.isSubscribed$.next(true);
        this.isProcessing$.next(false);
        this.toastr.success('¡Notificaciones activadas!'); 
      },
      error: err => {
        console.error('❌ Error al guardar la suscripción:', err);
        this.isProcessing$.next(false);
        this.toastr.error('Error', 'No se pudo registrar el dispositivo en el servidor');
      }
    });

  })
  .catch(err => {
    // 🚀 SALVAVIDAS: Si el usuario rechaza el permiso o cierra la ventana, liberamos el botón
    console.warn('El usuario rechazó las notificaciones o el navegador lo bloqueó:', err);
    this.isProcessing$.next(false);
    this.toastr.warning('Permiso denegado', 'Debes permitir las notificaciones en el navegador para activarlas.');
  });
}

guardarPushSubscription(subcripcion: any){
      const url = `${this.urlBackedNotification}`;
      return this.http.post(url, subcripcion, this.headers);
    }


 


 




}
