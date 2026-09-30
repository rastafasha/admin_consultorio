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
      const userString = localStorage.getItem('user');
      const userObj = userString ? JSON.parse(userString) : null;
      const currentUid = userObj && userObj.id ? userObj.id.toString() : 'GUEST';
      const miToken = localStorage.getItem('token') || '';

      // Convertimos la suscripción nativa a un JSON plano para evitar errores de compilación
      const subJson = sub.toJSON();

      const payloadBody = {
        endpoint: subJson.endpoint,
        expirationTime: subJson.expirationTime,
        keys: subJson.keys, 
        userId: currentUid 
      };

      const headers = {
        'x-token': miToken,
        'x-uid': currentUid,
        'X-Tenant-Slug': localStorage.getItem('tenant-slug') || 'default'
      };
      
      console.log('📡 [PWA SYNC] Despachando payload hacia Node para el usuario:', currentUid);

      // 4. HACER EL POST AL BACKEND
      this.http.post(this.urlBackedNotification, payloadBody, { headers }).subscribe({
        next: () => {
          console.log('✅ ¡Suscripción guardada con éxito en MongoDB Atlas!');
          this.isSubscribed$.next(true);
          this.isProcessing$.next(false);
          this.toastr.success('¡Notificaciones activadas!'); 

          // =========================================================================
          // 🚀 GLOBO NATIVO CORPORATIVO INSTANTÁNEO RE-INYECTADO
          // =========================================================================
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then((registration) => {
              const opcionesNotificacion: any = {
                body: 'Canal corporativo Klyntic. Recibirás aquí los reportes de pagos y alertas de agenda en vivo.',
                icon: 'assets/img/logo.png', // Ajusta esta ruta a los iconos de tu build de admin/browser
                badge: 'assets/img/logo.png',
                vibrate:[200, 100, 200], 
                tag: 'bienvenida-admin-klyntic'
              };

              registration.showNotification('💼 ¡Dashboard Admin Conectado!', opcionesNotificacion);
            }).catch(swErr => console.log('Aviso: Service Worker no disponible para el globo inmediato:', swErr));
          }
          // =========================================================================
        },
        error: err => {
          console.error('❌ Error al guardar la suscripción:', err);
          this.isProcessing$.next(false);
          this.toastr.error('Error', 'No se pudo registrar el dispositivo');
        }
      });
    })
    .catch(err => {
      console.warn('Registro de notificaciones push cancelado o bloqueado:', err);
      this.isProcessing$.next(false);
    });
  }


guardarPushSubscription(subcripcion: any){
      const url = `${this.urlBackedNotification}`;
      return this.http.post(url, subcripcion, this.headers);
    }


 





}
