import { Component, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { DataService } from 'src/app/shared/data/data.service';
import { MenuItem, SideBarData } from 'src/app/shared/models/models';
import { User } from 'src/app/models/user.model';
import { routes } from 'src/app/shared/routes/routes';
import { SideBarService } from 'src/app/shared/side-bar/side-bar.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
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
    router.events.subscribe((event: object) => {
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

    if (Array.isArray(this.user.roles) && this.user.roles.some((r: any) => r === "SUPERADMIN" || r.name === "SUPERADMIN")) {
      this.sidebarData = this.data.sideBar;
    } else {
      const permissions = Array.isArray(this.user.permissions) ? this.user.permissions : [];
      const SIDE_BAR_G: any[] = [];

      this.data.sideBar.forEach((side: any) => {
        const SIDE_B: any[] = [];
        side.menu.forEach((menu_s: any) => {
          const SUB_MENUS = (menu_s.subMenus || []).filter((submenu: any) => 
            permissions.includes(submenu.permision) && submenu.show_nav
          );
          if (SUB_MENUS.length > 0) {
            const menuCopy = { ...menu_s, subMenus: SUB_MENUS };
            SIDE_B.push(menuCopy);
          }
          if (permissions.includes(menu_s.permision)) {
            const menuCopy = { ...menu_s, subMenus: [] };
            SIDE_B.push(menuCopy);
          }
        });
        if (SIDE_B.length > 0) {
          const sideCopy = { ...side, menu: SIDE_B };
          SIDE_BAR_G.push(sideCopy);
        }
      });
      this.sidebarData = SIDE_BAR_G;
    }
  }

  public expandSubMenus(menu: MenuItem): void {
    sessionStorage.setItem('menuValue', menu.menuValue);
    this.sidebarData.map((mainMenus: SideBarData) => {
      mainMenus.menu.map((resMenu: MenuItem) => {
        if (resMenu.menuValue == menu.menuValue) {
          menu.showSubRoute = !menu.showSubRoute;
        } else {
          resMenu.showSubRoute = false;
        }
      });
    });
  }
  private getRoutes(route: { url: string }): void {
    const bodyTag = document.body;

    bodyTag.classList.remove('slide-nav')
    bodyTag.classList.remove('opened')
    this.currentUrl = route.url;

    const splitVal = route.url.split('/');


    this.base = splitVal[1];
    this.page = splitVal[2];
  }
  public miniSideBarMouseHover(position: string): void {
    if (position == 'over') {
      this.sideBar.expandSideBar.next("true");
    } else {
      this.sideBar.expandSideBar.next("false");
    }
  }

  logout(){
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
