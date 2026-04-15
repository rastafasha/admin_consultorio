import { Component } from '@angular/core';

@Component({
    selector: 'app-loader-anim',
    templateUrl: './loader-anim.component.html',
    styleUrls: ['./loader-anim.component.scss'],
    standalone: false
})
export class LoaderAnimComponent {

  public isLoading = true;
  public cargando = true;

}
