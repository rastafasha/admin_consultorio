import { Component, OnInit } from '@angular/core';

import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-status-online',
  templateUrl: './status-online.component.html',
  styleUrls: ['./status-online.component.scss']
})
export class StatusOnlineComponent implements OnInit {

  isOnline: boolean;
  modalVersion: boolean;

  constructor(private swUpdate: SwUpdate) {
    this.isOnline = false;
    this.modalVersion = false;
  }

  public ngOnInit(): void {

    window.addEventListener('online',  this.updateOnlineStatus.bind(this));
    window.addEventListener('offline', this.updateOnlineStatus.bind(this));

  
  }

  private updateOnlineStatus(): void {
    this.isOnline = window.navigator.onLine;
    console.info(`isOnline=[${this.isOnline}]`);
  }

}
