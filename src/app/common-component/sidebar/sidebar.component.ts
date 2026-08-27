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

    // Verificación de SUPERADMIN con bucle tradicional compatible
    let isSuperAdmin = false;
    if (this.user.roles && Array.isArray(this.user.roles)) {
      for (let i = 0; i < this.user.roles.length; i++) {
        const rol = this.user.roles[i];
        if (rol === "SUPERADMIN" || (rol && rol.name === "SUPERADMIN")) {
          isSuperAdmin = true;
          break;
        }
      }
    }

    if (isSuperAdmin) {
      this.sidebarData = this.data.sideBar;
      return;
    }

    // Filtrado de permisos con bucles FOR tradicionales (100% compatible con iOS viejo)
    const permissions = Array.isArray(this.user.permissions) ? this.user.permissions : [];
    const SIDE_BAR_G: any[] = [];

    if (this.data && Array.isArray(this.data.sideBar)) {
      for (let i = 0; i < this.data.sideBar.length; i++) {
        const side = this.data.sideBar[i];
        const SIDE_B: any[] = [];

        if (side && Array.isArray(side.menu)) {
          for (let j = 0; j < side.menu.length; j++) {
            const menu_s = side.menu[j];
            
            // Filtrar submenús manualmente (reemplaza a .filter e .includes)
            const SUB_MENUS: any[] = [];
            if (menu_s.subMenus && Array.isArray(menu_s.subMenus)) {
              for (let k = 0; k < menu_s.subMenus.length; k++) {
                const submenu = menu_s.subMenus[k];
                if (permissions.indexOf(submenu.permision) !== -1 && submenu.show_nav) {
                  SUB_MENUS.push(submenu);
                }
              }
            }

            if (SUB_MENUS.length > 0) {
              const menuCopy = Object.assign({}, menu_s, { subMenus: SUB_MENUS });
              SIDE_B.push(menuCopy);
            } else if (permissions.indexOf(menu_s.permision) !== -1) {
              const menuCopy = Object.assign({}, menu_s, { subMenus: [] });
              SIDE_B.push(menuCopy);
            }
          }
        }

        if (SIDE_B.length > 0) {
          const sideCopy = Object.assign({}, side, { menu: SIDE_B });
          SIDE_BAR_G.push(sideCopy);
        }
      }
    }

    this.sidebarData = SIDE_BAR_G;
  }

  public expandSubMenus(menu: any): void {
    if (!this.sidebarData) return;
    sessionStorage.setItem('menuValue', menu.menuValue);
    
    for (let i = 0; i < this.sidebarData.length; i++) {
      const mainMenus = this.sidebarData[i];
      if (mainMenus && mainMenus.menu) {
        for (let j = 0; j < mainMenus.menu.length; j++) {
          const resMenu = mainMenus.menu[j];
          if (resMenu.menuValue === menu.menuValue) {
            resMenu.showSubRoute = !resMenu.showSubRoute;
          } else {
            resMenu.showSubRoute = false;
          }
        }
      }
    }
  }

  private getRoutes(route: any): void {
    if (!route || !route.url) return;

    this.currentUrl = route.url;
    const splitVal = route.url.split('/');

    this.base = splitVal[1] || '';
    this.page = splitVal[2] || '';

    // No tocamos las clases del body en el constructor para evitar que el trigger muera en Safari móvil
    if (window && window.innerWidth > 768) {
      const bodyTag = document.body;
      if (bodyTag) {
        bodyTag.classList.remove('slide-nav');
        bodyTag.classList.remove('opened');
      }
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
