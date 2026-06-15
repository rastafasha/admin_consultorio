import { Component } from '@angular/core';
import { TasadollarbcvService } from '../../services/tasabcv.service';

@Component({
    selector: 'app-tasabcv',
    templateUrl: './tasabcv.component.html',
    styleUrls: ['./tasabcv.component.scss'],
    standalone: false
})
export class TasabcvComponent {
  tasa:number;

  constructor(
      private tasaBcvService: TasadollarbcvService,
    ) {
     
    }

  ngOnInit(): void {
    this.tasaBcvService.getUltimaTasa().subscribe((resp: any) => {
      this.tasa = resp.precio_dia;
    })
  }
  
}
