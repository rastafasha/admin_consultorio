import { Component } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import { PaymentMethod } from '../paymentMethod';
import { SettignService } from '../settigs.service';
import { DoctorService } from 'src/app/medical/doctors/service/doctor.service';
import { ActivatedRoute } from '@angular/router';

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
  user:any;
  doctor_id:any;
  roles:any;

  new_option: string = 'INACTIVE';

  constructor(
    private settigService: SettignService,
    private doctorService: DoctorService,
    private ativatedRoute: ActivatedRoute,
    ) {}

  ngOnInit(): void {
    this.doctorService.closeMenuSidebar();
    let USER = localStorage.getItem("user");
    this.user = JSON.parse(USER ? USER: '');
    this.roles = this.user.roles[0];
    
   
    this.ativatedRoute.params.subscribe((resp:any)=>{
      this.doctor_id = resp.doctor_id;
      if(!this.doctor_id){
        this.doctor_id = this.user.id;
      }else{
        this.doctor_id = resp.doctor_id;
      }
      // console.log(this.doctor_id);
    });
    // this.getTiposdePago();
    this.getTiposdePagoByDoctor();
  }

  isPermission(permission:string){
    if(this.user.roles.includes('SUPERADMIN')){
      return true;
    }
    if(this.user.permissions.includes(permission)){
      return true;
    }
    return false;
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
  getTiposdePagoByDoctor(){
      this.settigService.getPagoByDoctor(this.doctor_id).subscribe((resp:any)=>{
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
          this.getTiposdePagoByDoctor();
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
        email: this.email,
        doctor_id: this.doctor_id
      }
      this.settigService.create(data).subscribe((resp:any)=>{
        // console.log(resp);
        this.getTiposdePagoByDoctor();
      })
    }
  
  deleteTipoPago(tiposdepago:any){

      this.settigService.delete(tiposdepago.id).subscribe(
        (resp:any) =>{
          this.getTiposdePagoByDoctor();
        });
      
    }
  
    
}
