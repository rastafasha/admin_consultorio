import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { SettignService } from '../../core/settings/settigs.service';
import { User } from '../../models/user.model';
import { AuthService } from '../../shared/auth/auth.service';
import { routes } from '../../shared/routes/routes';
import { SideBarService } from '../../shared/side-bar/side-bar.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    standalone: false
})
export class HeaderComponent implements OnInit, OnDestroy {
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
  

  constructor(
    public router: Router,
    private sideBar: SideBarService,
    public authService: AuthService,
    public activatedRoute: ActivatedRoute,
    public settingService: SettignService,
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

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
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
  }
