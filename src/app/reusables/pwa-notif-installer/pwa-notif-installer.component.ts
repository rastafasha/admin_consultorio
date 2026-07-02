import { Platform } from '@angular/cdk/platform';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

@Component({
  selector: 'app-pwa-notif-installer',
  standalone: false,
  templateUrl: './pwa-notif-installer.component.html',
  styleUrls: ['./pwa-notif-installer.component.css']
})
export class PwaNotifInstallerComponent implements OnInit, OnDestroy {

  isOnline: boolean = false;
  modalVersion: boolean = false;
  modalPwaPlatform: string | undefined = undefined;

  isIOS: boolean;
  isAndroid: boolean;
  
  // Guardamos la función para poder remover el listener limpiamente
  private pwaListenerBind: any;

  constructor(
    private swUpdate: SwUpdate,
    private platform: Platform,
  ) { 
    this.isIOS = this.platform.IOS;
    this.isAndroid = this.platform.ANDROID; 
  }

  ngOnInit(): void {
    this.initPwa();
    this.verificarInstalacionAndroid();
  }

  ngOnDestroy(): void {
    // Limpieza de memoria
    window.removeEventListener('pwa-prompt-ready', this.pwaListenerBind);
  }

  private verificarInstalacionAndroid(): void {
    if (!this.isAndroid) return;

    // 1. Si el index.html ya atrapó el evento antes de que Angular cargara
    if ((window as any).deferredPrompt) {
      this.modalPwaPlatform = 'ANDROID';
    } else {
      // 2. Si Angular cargó volando y el evento aún no ha ocurrido, lo escuchamos aquí
      this.pwaListenerBind = () => {
        if ((window as any).deferredPrompt) {
          this.modalPwaPlatform = 'ANDROID';
        }
      };
      window.addEventListener('pwa-prompt-ready', this.pwaListenerBind);
    }
  }

  initPwa() {
  this.isOnline = window.navigator.onLine;

  if (this.swUpdate.isEnabled) {
    this.swUpdate.versionUpdates.pipe(
      filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
    ).subscribe(() => {
      this.modalVersion = true; 
    });

    // 💡 Aumentamos a 4 segundos para acoplarse con la estrategia del módulo
    setTimeout(() => {
      this.swUpdate.checkForUpdate().catch(err => console.error("Error SW:", err));
    }, 4000);
  }

  this.checkIOSStandalone();
}

  public updateVersion(): void {
    this.swUpdate.activateUpdate().then(() => {
      window.location.reload(); 
    });
  }

  private checkIOSStandalone(): void {
    if (this.isIOS) {
      const isInStandaloneMode = ('standalone' in window.navigator) && ((window.navigator as any).standalone);
      if (!isInStandaloneMode) {
        this.modalPwaPlatform = 'IOS';
      }
    }
  }

  public addToHomeScreen(): void {
    const promptEvent = (window as any).deferredPrompt;
    if (promptEvent) {
      promptEvent.prompt();
      promptEvent.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          (window as any).deferredPrompt = null;
          this.modalPwaPlatform = undefined;
        }
      });
    }
  }

  public closeVersion(): void { this.modalVersion = false; }
  public closePwa(): void { this.modalPwaPlatform = undefined; }


}
