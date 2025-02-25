import { Platform } from '@angular/cdk/platform';
import { Component, OnInit } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, map } from 'rxjs';
import { PwaService } from 'src/app/services/pwa.service';

@Component({
  selector: 'app-boton-intall-pwa',
  templateUrl: './boton-intall-pwa.component.html',
  styleUrls: ['./boton-intall-pwa.component.scss']
})
export class BotonIntallPwaComponent implements OnInit {

  // pwa
  isOnline: boolean;
  modalVersion: boolean;
  modalPwaEvent: any;
  modalPwaPlatform: string|undefined;

  constructor(
    private swUpdate: SwUpdate,
    private platform: Platform,
    public pwa: PwaService
  ) { 
    this.isOnline = false;
    this.modalVersion = false;
  }

  ngOnInit(): void {
    this.initPwa();
  }


initPwa(){
  this.updateOnlineStatus();

    window.addEventListener('online',  this.updateOnlineStatus.bind(this));
    window.addEventListener('offline', this.updateOnlineStatus.bind(this));


    let installPrompt = null;
    const installButton = document.querySelector("#install");

    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      installPrompt = event;
      installButton.removeAttribute("hidden");
    });

    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.pipe(
        filter((evt: any): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
        map((evt: any) => {
          console.info(`currentVersion=[${evt.currentVersion} | latestVersion=[${evt.latestVersion}]`);
          this.modalVersion = true;
        }),
      );
    }

    this.loadModalPwa();
}



private updateOnlineStatus(): void {
  this.isOnline = window.navigator.onLine;
  console.info(`isOnline=[${this.isOnline}]`);
}

public updateVersion(): void {
  this.modalVersion = false;
  window.location.reload();
}

public closeVersion(): void {
  this.modalVersion = false;
}

private loadModalPwa(): void {
  if (this.platform.ANDROID) {
    window.addEventListener('beforeinstallprompt', (event: any) => {
      event.preventDefault();
      this.modalPwaEvent = event;
      this.modalPwaPlatform = 'ANDROID';
    });
  }

  if (this.platform.IOS && this.platform.SAFARI) {
    const isInStandaloneMode = ('standalone' in window.navigator) && ((<any>window.navigator)['standalone']);
    if (!isInStandaloneMode) {
      this.modalPwaPlatform = 'IOS';
    }
  }
  if ( this.platform.SAFARI) {
    const isInStandaloneMode = ('standalone' in window.navigator) && ((<any>window.navigator)['standalone']);
    if (!isInStandaloneMode) {
      this.modalPwaPlatform = 'SAFARI';
    }
  }
  
}



addToHomeScreenCrome(){
  this.modalPwaEvent.prompt();
  this.modalPwaPlatform = undefined;
}

public addToHomeScreen(): void {
  this.modalPwaEvent.prompt();
  this.modalPwaPlatform = undefined;
}

public closePwa(): void {
  this.modalPwaPlatform = undefined;
}
}

