import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../shared/data/data.service';
import { SideBarData, MenuItem } from '../shared/models/models';
import { SideBarService } from '../shared/side-bar/side-bar.service';
interface Route {
  url: string;
  // Add other properties if necessary
}
@Component({
    selector: 'app-medical',
    templateUrl: './medical.component.html',
    styleUrls: ['./medical.component.scss'],
    standalone: false
})
export class MedicalComponent {
  public miniSidebar = 'false';
  public expandMenu = 'false';
  public mobileSidebar = 'false';
  public sideBarActivePath = false;
  public headerActivePath = false;
  base = '';
  page = '';
  currentUrl = '';

  constructor(private sideBar: SideBarService, public router: Router, private data: DataService) 
  {
    // 🎯 NUEVO: Escuchamos activamente los cambios de ruta para que no se congele en móviles
    this.router.events.subscribe((event) => {
      // Importa NavigationEnd desde '@angular/router' arriba si te hace falta
      // Pero para asegurar compatibilidad total en iOS viejo, evaluamos de forma directa:
      if (event && event.constructor.name === 'NavigationEnd') {
        this.getRoutes(event as Route);
      }
    });
    this.getRoutes(this.router);

    this.sideBar.toggleSideBar.subscribe((res: string) => {
      this.miniSidebar = res === 'true' ? 'true' : 'false';
    });

    this.sideBar.toggleMobileSideBar.subscribe((res: string) => {
      this.mobileSidebar = res === 'true' ? 'true' : 'false';
    });

    this.sideBar.expandSideBar.subscribe((res: string) => {
      this.expandMenu = res;
      if (res == 'false' && this.miniSidebar == 'true') {
        this.data.sideBar.map((mainMenus: SideBarData) => {
          mainMenus.menu.map((resMenu: MenuItem) => {
            resMenu.showSubRoute = false;
          });
        });
      }
      if (res == 'true' && this.miniSidebar == 'true') {
        this.data.sideBar.map((mainMenus: SideBarData) => {
          mainMenus.menu.map((resMenu: MenuItem) => {
            const menuValue = sessionStorage.getItem('menuValue');
            if (menuValue && menuValue == resMenu.menuValue) {
              resMenu.showSubRoute = true;
            } else {
              resMenu.showSubRoute = false;
            }
          });
        });
      }
    });
  }

  public toggleMobileSideBar(): void {
    this.sideBar.switchMobileSideBarPosition();
  }

  private getRoutes(route: Route): void {
    // Protección por si la URL llega vacía en Safari móvil al inicializar
    if (!route || !route.url) {
      this.sideBarActivePath = true;
      this.headerActivePath = true;
      return;
    }

    const partesUrl = route.url.split('/');
    if (partesUrl[2] === 'confirm-mail') {
      this.sideBarActivePath = false;
      this.headerActivePath = false;
    } else {
      this.sideBarActivePath = true;
      this.headerActivePath = true;
    }
  }
}
