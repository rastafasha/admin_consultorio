import { Component } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import { PaymentMethod } from '../paymentMethod';
import { SettignService } from '../settigs.service';
import { DoctorService } from 'src/app/medical/doctors/service/doctor.service';

@Component({
  selector: 'app-payment-settings',
  templateUrl: './payment-settings.component.html',
  styleUrls: ['./payment-settings.component.scss']
})
export class PaymentSettingsComponent {
  public routes = routes;

  public tiposdepago: PaymentMethod;
  error: string;
  uploadError: string;
  tipoSeleccionado:any;
  pagoSeleccionado:any;
  tiposdepagos:any;

  bankAccountType:string;
  bankName:string;
  bankAccount:string;
  ciorif:string;
  telefono:string;
  email:string;
  tipo:string;

  new_option: string = 'INACTIVE';

  constructor(
    private settigService: SettignService,
    private doctorService: DoctorService,
    ) {}

  ngOnInit(): void {
      this.getTiposdePago();
      this.doctorService.closeMenuSidebar();
  }

  selectedTypeEdit(tipo:any){
      this.pagoSeleccionado = tipo;
      // console.log(this.pagoSeleccionado);
  }

  selectedType(tipodepago:any){
      this.tipoSeleccionado = tipodepago;
      // console.log(this.tipoSeleccionado);
  }

  getTiposdePago(){
      this.settigService.getAll().subscribe((resp:any)=>{
        console.log(resp);
        this.tiposdepagos = resp.tiposdepagos;
        // console.log(this.tiposdepagos);
      })
  }
  
  cambiarStatus(tipodepago:any){
      let VALUE = tipodepago.status;
      // console.log(VALUE);
      
      this.settigService.updateStatus(tipodepago, tipodepago.id).subscribe(
        resp =>{
          // console.log(resp);
          // Swal.fire('Actualizado', `actualizado correctamente`, 'success');
          // this.toaster.open({
          //   text:'Producto Actualizado!',
          //   caption:'Mensaje de Validación',
          //   type:'success',
          // })
          this.getTiposdePago();
        }
      )
    }



  save(){

      let data = {
        tipo: this.tipo,
        bankAccountType: this.bankAccountType,
        bankName: this.bankName,
        bankAccount: this.bankAccount,
        ciorif:this.ciorif,
        telefono:this.telefono,
        email: this.email
      }
      this.settigService.create(data).subscribe((resp:any)=>{
        // console.log(resp);
        this.getTiposdePago();
      })
    }
  
  deleteTipoPago(tiposdepago:any){

      this.settigService.delete(tiposdepago.id).subscribe(
        (resp:any) =>{
          this.getTiposdePago();
        });
      
    }
  
    
}
