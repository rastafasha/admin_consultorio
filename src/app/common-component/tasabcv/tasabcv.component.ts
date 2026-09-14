import { Component } from '@angular/core';
import { TasadollarbcvService } from '../../services/tasabcv.service';
import { DoctorService } from '../../services/doctor.service';
import { TasaeurobcvService } from '../../services/tasaeurobcv.service';
import { TasapersonalizadaService } from '../../services/tasapersonalizada.service';

@Component({
    selector: 'app-tasabcv',
    templateUrl: './tasabcv.component.html',
    styleUrls: ['./tasabcv.component.scss'],
    standalone: false
})
export class TasabcvComponent {
  tasa:number;
  moneda:string;
  user:any;
  isLoading=false;
  public tasadollar;
  public tasaeuro;

  constructor(
      private tasaBcvService: TasadollarbcvService,
      private tasaEuroBcvService: TasaeurobcvService,
      private tasaPersonalizadaService: TasapersonalizadaService,
      public doctorService: DoctorService,
    ) {
     
    }

  ngOnInit(): void {
    const USER = localStorage.getItem("user");
    this.user = JSON.parse(USER ? USER : '');

     this.getDoctorMoneda();
    // this.tasaBcvService.getUltimaTasa().subscribe((resp: any) => {
    //   this.tasa = resp.precio_dia;
    // })
  }

  getDoctorMoneda(){
    
    this.doctorService.showDoctor(+this.user.id!).subscribe((resp: any) => {
      this.moneda = resp.user.moneda;
      if(this.moneda === 'USD'){
         this.getTasaDollarUltima();
      }
      if(this.moneda === 'EUR'){
         this.getTasaEuroUltima();
      }
      if(this.moneda === 'PERSONALIZADA'){
         this.getTasaPersonalizada();
      }
    })
  }

   getTasaDollarUltima(){
    this.isLoading = true;
    this.tasaBcvService.getUltimaTasa().subscribe((resp:any)=>{
      this.tasadollar = resp.precio_dia;
      this.isLoading = false;
    })
  }
  getTasaEuroUltima(){
    this.isLoading = true;
    this.tasaEuroBcvService.getUltimaTasa().subscribe((resp:any)=>{
      this.tasaeuro = resp.precio_dia;
      this.isLoading = false;
    })
  }
  getTasaPersonalizada(){
    this.isLoading = true;
    this.tasaPersonalizadaService.getTasasByUser(this.user.id).subscribe((resp:any)=>{
      this.tasa = resp.tasa.precio_dia;
      this.isLoading = false;
    })
  }

  
  
}
