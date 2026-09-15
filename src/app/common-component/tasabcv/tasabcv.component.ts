import { Component } from '@angular/core';
import { TasadollarbcvService } from '../../services/tasabcv.service';
import { DoctorService } from '../../services/doctor.service';
import { TasaeurobcvService } from '../../services/tasaeurobcv.service';
import { TasapersonalizadaService } from '../../services/tasapersonalizada.service';
import { switchMap, of } from 'rxjs';

@Component({
    selector: 'app-tasabcv',
    templateUrl: './tasabcv.component.html',
    styleUrls: ['./tasabcv.component.scss'],
    standalone: false
})
export class TasabcvComponent {
  tasa:number;
  user:any;
  isLoading=false;
  public moneda:string;
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

  getDoctorMoneda() {
  this.doctorService.showDoctorMoneda(+this.user.id!).pipe(
    switchMap((resp: any) => {
      this.moneda = resp.moneda;

      // Diccionario que asocia cada moneda con su respectivo servicio HTTP observable
      const estrategiasTasa: { [key: string]: () => any } = {
        'USD': () => this.tasaBcvService.getUltimaTasa(),
        'EUR': () => this.tasaEuroBcvService.getUltimaTasa(),
        'PERSONALIZADA': () => this.tasaPersonalizadaService.getTasasByUser(this.user.id)
      };

      // Si la moneda existe en nuestro mapa, ejecutamos su servicio. Si no, detenemos el flujo.
      return estrategiasTasa[this.moneda] ? estrategiasTasa[this.moneda]() : of(null);
    })
  ).subscribe({
    next: (respTasa: any) => {
      if (!respTasa) return;

      // Extraemos el valor de la tasa adaptándonos a la estructura de la respuesta
      // (Si es PERSONALIZADA viene en resp.tasa.precio_dia, si no, viene en resp.precio_dia)
      const valorTasa = this.moneda === 'PERSONALIZADA' 
        ? respTasa.tasa?.precio_dia 
        : respTasa.precio_dia;

      // Guardamos la tasa en la variable global correspondiente por si la usas en otro lado
      if (this.moneda === 'USD') this.tasadollar = valorTasa;
      if (this.moneda === 'EUR') this.tasaeuro = valorTasa;
      if (this.moneda === 'PERSONALIZADA') this.tasa = valorTasa;

      
    },
    error: (err) => console.error("Error procesando moneda y tasas:", err)
  });
}

  
  
}
