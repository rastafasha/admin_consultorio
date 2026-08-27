import { Component, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { User } from '../../models/user.model';
import { AuthService } from '../../shared/auth/auth.service';
import { DataService } from '../../shared/data/data.service';
import { SideBarData, MenuItem } from '../../shared/models/models';
import { routes } from '../../shared/routes/routes';
import { SideBarService } from '../../shared/side-bar/side-bar.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    standalone: false
})
export class SidebarComponent implements OnInit {
  base = '';
  page = '';
  currentUrl = '';
  public classAdd = false;
  year: number = new Date().getFullYear();

  public multilevel: Array<boolean> = [false, false, false];

  public routes = routes;
  public sidebarData: Array<SideBarData> = [];
  public user: User | null = null;
  constructor(
    private data: DataService,
    private router: Router,
    private sideBar: SideBarService,
    public authService: AuthService
  ) {
    // Escuchamos la navegación de forma segura
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.getRoutes(event);
      }
    });
    this.getRoutes(this.router);
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.user = user;
      this.loadSidebarData();
    });
  }

  private loadSidebarData(): void {
    if (!this.user) {
      this.sidebarData = [];
      return;
    }

    // 1. Si es SUPERADMIN, cargamos el menú completo directo de DataService
    if (Array.isArray(this.user.roles) && this.user.roles.some((r: any) => r === "SUPERADMIN" || r.name === "SUPERADMIN")) {
      this.sidebarData = this.data.sideBar;
      return;
    }

    // 2. Filtrado seguro de permisos para el Médico / Staff
    const permissions = Array.isArray(this.user.permissions) ? this.user.permissions : [];
    const SIDE_BAR_G: any[] = [];

    this.data.sideBar.forEach((side: any) => {
      const SIDE_B: any[] = [];

      side.menu.forEach((menu_s: any) => {
        // Filtramos submenús si existen
        const SUB_MENUS = (menu_s.subMenus || []).filter((submenu: any) => 
          permissions.includes(submenu.permision) && submenu.show_nav
        );

        // Si tiene submenús aprobados, añadimos el menú con sus hijos
        if (SUB_MENUS.length > 0) {
          SIDE_B.push({ ...menu_s, subMenus: SUB_MENUS });
        } 
        // Si no tiene submenús pero el menú principal está aprobado, lo agregamos plano
        else if (permissions.includes(menu_s.permision)) {
          SIDE_B.push({ ...menu_s, subMenus: [] });
        }
      });

      if (SIDE_B.length > 0) {
        SIDE_BAR_G.push({ ...side, menu: SIDE_B });
      }
    });

    this.sidebarData = SIDE_BAR_G;
  }

  public expandSubMenus(menu: any): void {
    sessionStorage.setItem('menuValue', menu.menuValue);
    this.sidebarData.forEach((mainMenus: any) => {
      mainMenus.menu.forEach((resMenu: any) => {
        if (resMenu.menuValue === menu.menuValue) {
          resMenu.showSubRoute = !resMenu.showSubRoute;
        } else {
          resMenu.showSubRoute = false;
        }
      });
    });
  }

  private getRoutes(route: { url: string }): void {
    if (!route || !route.url) return;

    this.currentUrl = route.url;
    const splitVal = route.url.split('/');

    this.base = splitVal[1] || '';
    this.page = splitVal[2] || '';

    // 🚀 CORRECCIÓN CRÍTICA: Solo removemos las clases de control si la pantalla NO es móvil,
    // evitando que el script de AdminLTE se rompa al abrir la hamburguesa en el iPhone 6s
    if (window.innerWidth > 768) {
      const bodyTag = document.body;
      bodyTag.classList.remove('slide-nav');
      bodyTag.classList.remove('opened');
    }
  }

  public miniSideBarMouseHover(position: string): void {
    if (position === 'over') {
      this.sideBar.expandSideBar.next("true");
    } else {
      this.sideBar.expandSideBar.next("false");
    }
  }

  logout() {
    this.authService.logout();
  }





//boton install pwa

  public promptEvent;

@HostListener('window:beforeinstallprompt', ['$event'])
onbeforeinstallprompt(e) {
  e.preventDefault();
  this.promptEvent = e;
}

public installPWA() {
  this.promptEvent.prompt();
}

public shouldInstall(): boolean {
  return !this.isRunningStandalone() && this.promptEvent;
}

public isRunningStandalone(): boolean {
  return (window.matchMedia('(display-mode: standalone)').matches);
}

  

}
