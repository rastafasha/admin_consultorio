import { Component } from '@angular/core';
import { routes } from '../../shared/routes/routes';

@Component({
    selector: 'app-error404',
    templateUrl: './error404.component.html',
    styleUrls: ['./error404.component.scss'],
    standalone: false
})
export class Error404Component {
  public routes = routes;
}
