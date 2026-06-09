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
  public miniSidebar  = false;
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
    public pushService: PushNotificationService, // Debe ser PUBLIC para que el HTML acceda a él
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
    // Al abrir el Dashboard, sincronizamos el Switch con el estado real del navegador
    if (Notification.permission === 'granted') {
      this.pushService.isSubscribed$.next(true);
    } else {
      this.pushService.isSubscribed$.next(false);
    }
    
    this.userSubscription = this.authService.currentUser$.subscribe((user) => {
      this.user = user;
      if (user && this.user_id) {
        this.getDoctor();
      }
    });

    window.scrollTo(0, 0);
    this.activatedRoute.params.subscribe((resp:any)=>{
      // console.log(resp);
      this.user_id = resp.id;
      if (this.user) {
        this.getDoctor();
      }
    });
    this.getSettings();
  }

  togglePush() {
    // Evaluamos el estado guardado en el BehaviorSubject de tu servicio
    const estaSuscrito = this.pushService.isSubscribed$.value;

    if (!estaSuscrito) {
      // 🟢 EL ADMINISTRADOR PRENDIÓ EL SWITCH
      this.pushService.isProcessing$.next(true);

      this.swPush.requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY
      })
      .then(sub => {
        // Guardamos la suscripción en tu base de datos mediante tu servicio
        this.pushService.guardarPushSubscription(sub).subscribe({
          next: () => {
            this.pushService.isSubscribed$.next(true);
            this.pushService.isProcessing$.next(false);
            this.toastr.success('¡Notificaciones del Dashboard activadas! 🔔');
          },
          error: (err) => {
            console.error('Error guardando sub en backend:', err);
            this.pushService.isProcessing$.next(false);
            this.toastr.error('Error', 'No se pudo registrar este dispositivo en el servidor');
          }
        });
      })
      .catch(err => {
        // Si el admin cancela el permiso flotante, apagamos el switch automáticamente
        console.warn('Permiso denegado por el usuario:', err);
        this.pushService.isProcessing$.next(false);
        this.pushService.isSubscribed$.next(false);
        this.toastr.warning('Permiso requerido', 'Debes permitir las notificaciones en la ventana del navegador');
      });

    } else {
      // 🔴 EL ADMINISTRADOR APAGÓ EL SWITCH
      this.pushService.isProcessing$.next(true);

      this.swPush.unsubscribe()
        .then(() => {
          this.pushService.isSubscribed$.next(false);
          this.pushService.isProcessing$.next(false);
          this.toastr.info('Notificaciones del Dashboard desactivadas');
        })
        .catch(err => {
          console.error('Error al desuscribir del service worker:', err);
          this.pushService.isProcessing$.next(false);
        });
    }
  }

 



  getSettings(){
    this.settingService.getAllSettings().subscribe((resp:any)=>{
      // console.log(resp);
      this.settings= resp.settings.data;
      this.setting_selectedId= resp.settings.data[0].id;
      this.avatar_setting= resp.settings.data[0].avatar;
      this.name_setting= resp.settings.data[0].name;
    })
}
  
  getDoctor(){
    this.authService.getUserRomoto(this.user_id).subscribe((resp:any)=>{
      // console.log(resp);
      this.usuario = resp;
    })
  }

  openBoxFunc() {
    this.openBox = !this.openBox;
    /* eslint no-var: off */
    var mainWrapper = document.getElementsByClassName('main-wrapper')[0];
    if (this.openBox) {
      mainWrapper.classList.add('open-msg-box');
    } else {
      mainWrapper.classList.remove('open-msg-box');
    }
  }

  


  public toggleSideBar(): void {
    this.sideBar.switchSideMenuPosition();
    this.addClass = !this.addClass;
      /* eslint no-var: off */
      var root = document.getElementsByTagName( 'html' )[0];
      /* eslint no-var: off */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      var sidebar:any = document.getElementById('sidebar')
    
      if (this.addClass) {
        root.classList.add('menu-opened');
        sidebar.classList.add('opened');
        
      }
      else {
        root.classList.remove('menu-opened');
        sidebar.classList.remove('opened');
      }
      console.log('pulsado');
  }

  public toggleMobileSideBar(): void {
    this.sideBar.switchMobileSideBarPosition();
    
    this.addClass = !this.addClass;
    /* eslint no-var: off */
    var root = document.getElementsByTagName( 'html' )[0];
    /* eslint no-var: off */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var sidebar:any = document.getElementById('sidebar')
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



    logout(){
      this.authService.logout();
    }

     ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  }
