import { Component } from '@angular/core';
import { TasabcvService } from 'src/app/services/tasabcv.service';

@Component({
  selector: 'app-tasabcv',
  templateUrl: './tasabcv.component.html',
  styleUrls: ['./tasabcv.component.scss']
})
export class TasabcvComponent {
  tasa:number;

  constructor(
      private tasaBcvService: TasabcvService,
    ) {
     
    }

  ngOnInit(): void {
    this.tasaBcvService.getUltimaTasa().subscribe((resp: any) => {
      this.tasa = resp.precio_dia;
    })
  }
  
}
