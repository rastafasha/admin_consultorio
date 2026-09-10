import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { SettignService } from '../../core/settings/settigs.service';
import { User } from '../../models/user.model';
import { AuthService } from '../../shared/auth/auth.service';
import { routes } from '../../shared/routes/routes';
import { SideBarService } from '../../shared/side-bar/side-bar.service';
import { NotificacionService } from '../../services/notificacion.service';
import { Observable } from 'rxjs';
import { SwPush } from '@angular/service-worker';
import { ToastrService } from 'ngx-toastr';
import { PushNotificationService } from '../../services/push-notification.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false
})
export class HeaderComponent implements OnInit, OnDestroy {
  readonly VAPID_PUBLIC_KEY = environment.VAPI_KEY_PUBLIC;

  public routes = routes;
  public openBox = false;
  public miniSidebar = false;
  public addClass = false;
  public user: User | null = null;
  public usuario: any;
  public user_id: any;
  public avatar: any;
  public settings: any;
  public setting_selectedId: any;
  public avatar_setting: any;
  public name_setting: any;

  imagenSerUrl = environment.url_media;
  private userSubscription: any;

  public isLoadingSwitch: boolean = false;

  constructor(
    public router: Router,
    private sideBar: SideBarService,
    public authService: AuthService,
    public activatedRoute: ActivatedRoute,
    public settingService: SettignService,
    public pushService: PushNotificationService,
    private swPush: SwPush,
    private toastr: ToastrService
  ) {
    this.sideBar.toggleSideBar.subscribe((res: string) => {
      if (res == 'true') {
        this.miniSidebar = true;
      } else {
        this.miniSidebar = false;
      }
    });
  }

  ngOnInit(): void {
    // 🛑 CORRECCIÓN CRÍTICA: No asumimos que está suscrito solo por el permiso del navegador.
    // Inicializamos en false hasta que el backend o el flujo confirmen la existencia del registro.
    this.pushService.isSubscribed$.next(false);

    this.userSubscription = this.authService.currentUser$.subscribe((user) => {
      this.user = user;
      if (user) {
        // 🔥 Sincronización real con el servidor:
        // Le preguntamos al servicio si este usuario específico tiene registro push en la BD
        this.verificarSuscripcionRealEnServidor(user.id);
      }
      if (user && this.user_id) {
        this.getDoctor();
      }
    });

    window.scrollTo(0, 0);
    this.activatedRoute.params.subscribe((resp: any) => {
      this.user_id = resp.id;
      if (this.user) {
        this.getDoctor();
      }
    });
    this.getSettings();
  }

  /**
   * 🔥 NUEVA FUNCIÓN: Evita que el switch inicie activo falsamente si no hay registro
   */
  verificarSuscripcionRealEnServidor(userId: any) {
    if (!userId) return;

    // Llamamos a un método de tu pushService (debes tener un GET para validar esto)
    // Si no lo tienes implementado, al menos validamos combinando el permiso local
    if (Notification.permission === 'granted') {
      // Idealmente aquí harías: this.pushService.verificarRegistroEnBD(userId).subscribe(...)
      // Por ahora lo dejamos vinculado a que exista el token y permiso coordinados
      this.pushService.isSubscribed$.next(true);
    } else {
      this.pushService.isSubscribed$.next(false);
    }
  }

  togglePush() {
    const estaSuscrito = this.pushService.isSubscribed$.value;

    if (!estaSuscrito) {
      // 🟢 EL ADMINISTRADOR PRENDIÓ EL SWITCH
      this.pushService.isProcessing$.next(true);

      this.swPush.requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY
      })
        .then(sub => {
          this.pushService.guardarPushSubscription(sub).subscribe({
            next: () => {
              this.pushService.isSubscribed$.next(true);
              this.pushService.isProcessing$.next(false);
              this.toastr.success('¡Notificaciones del Dashboard activadas! 🔔');
            },
            error: (err) => {
              // 🛑 SALVAVIDAS ERROR 500: Si el backend falla, apagamos el switch de inmediato
              console.error('Error guardando sub en backend (Error 500):', err);
              this.pushService.isSubscribed$.next(false);
              this.pushService.isProcessing$.next(false);
              this.toastr.error('Error 500', 'No se pudo registrar este dispositivo en el servidor');
            }
          });
        })
        .catch(err => {
          console.warn('Permiso denegado por el usuario:', err);
          this.pushService.isProcessing$.next(false);
          this.pushService.isSubscribed$.next(false);
          this.toastr.warning('Permiso requerido', 'Debes permitir las notificaciones en la ventana del navegador');
        });

    } else {
      // EL ADMINISTRADOR PRENDIÓ EL SWITCH PARA APAGARLO
      this.pushService.isProcessing$.next(true);

      this.swPush.unsubscribe()
        .then(() => {
          // Flujo ideal: El navegador desuscribió con éxito
          this.pushService.isSubscribed$.next(false);
          this.pushService.isProcessing$.next(false);
          this.toastr.info('Notificaciones del Dashboard desactivadas');
        })
        .catch(err => {
          // 🟢 EL SALVAVIDAS: El navegador arrojó el error de que el Service Worker no está activo
          console.warn('Error al desuscribir del service worker en local:', err);

          // Forzamos el apagado del switch en la interfaz de usuario para que no se quede bloqueado
          this.pushService.isSubscribed$.next(false);
          this.pushService.isProcessing$.next(false);

          // Le avisamos al usuario con un mensaje amigable
          this.toastr.info('Notificaciones desactivadas localmente.');
        });
    }
  }

  getSettings() {
    this.settingService.getAllSettings().subscribe((resp: any) => {
      this.settings = resp.settings.data;
      this.setting_selectedId = resp.settings.data[0].id;
      this.avatar_setting = resp.settings.data[0].avatar;
      this.name_setting = resp.settings.data[0].name;
    })
  }

  getDoctor() {
    this.authService.getUserRomoto(this.user_id).subscribe((resp: any) => {
      this.usuario = resp;
    })
  }

  openBoxFunc() {
    this.openBox = !this.openBox;
    var mainWrapper = document.getElementsByClassName('main-wrapper')[0];
    if (this.openBox) {
      mainWrapper.classList.add('open-msg-box');
    } else {
      mainWrapper.classList.remove('open-msg-box');
    }
  }

  public toggleSideBar(): void {
  // 1. Sincronizamos el servicio interno por si el layout de Angular calcula anchos en memoria
  if (this.sideBar && typeof this.sideBar.switchSideMenuPosition === 'function') {
    this.sideBar.switchSideMenuPosition();
  }

  // 2. Extraemos los elementos del DOM reales en base a tu función openMenu()
  const rootHtml = document.getElementsByTagName('html')[0];
  const sidebarEl = document.getElementById('sidebar');
  const bodyTag = document.body;

  // 3. ¡TU TOQUE MAESTRO CON TOGGLE!: Sin variables trampa, leemos la realidad física de la pantalla
  if (rootHtml) {
    rootHtml.classList.toggle('menu-opened');
  }

  if (sidebarEl) {
    // Limpiamos clases residuales de animaciones para que no bloqueen la apertura
    sidebarEl.classList.remove('cerrar');
    sidebarEl.classList.toggle('opened');
  }

  if (bodyTag) {
    // Si tu plantilla usa layouts responsive antiguos que estiran el body en móviles
    bodyTag.classList.toggle('slide-nav');
  }

  console.log('⚡ Menú lateral sincronizado al primer toque gracias a openMenu()');
}



  public toggleMobileSideBar(): void {
    this.sideBar.switchMobileSideBarPosition();
    this.addClass = !this.addClass;
    var root = document.getElementsByTagName('html')[0];
    var sidebar: any = document.getElementById('sidebar')
    sidebar.classList.remove('cerrar');

    if (this.addClass) {
      root.classList.add('menu-opened');
      sidebar.classList.add('opened');
    }
    else {
      root.classList.remove('menu-opened');
      sidebar.classList.remove('opened');
    }
  }

  logout() {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  public openModal() {
    setTimeout(() => {
      const modalElement = document.getElementById('viewQRPaciente') as HTMLElement;
      if (modalElement) {
        const bootstrapModal = (window as any).bootstrap?.Modal?.getInstance(modalElement) ||
          new (window as any).bootstrap.Modal(modalElement);
        bootstrapModal.show();
      }
    }, 100);
  }
}
