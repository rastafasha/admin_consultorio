import { Component } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import { SettignService } from '../settigs.service';
import { DoctorService } from 'src/app/medical/doctors/service/doctor.service';
import Swal from 'sweetalert2';
interface data {
  value: string ;
}
@Component({
  selector: 'app-general-settings',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.scss']
})
export class GeneralSettingsComponent {
  public routes = routes;
  public deleteIcon1 = true;
  public deleteIcon2  = true;
  public selectedValue! : string ;

  public name: any;
  public address: any;
  public phone: any;
  public city: any;
  public state: any;
  public zip: any;
  public country: any;
  public setting: any;
  public settings: any;
  public setting_selectedId: any;

  public FILE_AVATAR:any;
  public IMAGE_PREVISUALIZA:any = 'assets/img/user-06.jpg';

  valid_form:boolean = false;
  valid_form_success:boolean = false;

  public text_success:string = '';
  public text_validation:string = '';

  constructor(
    public settingService: SettignService,
    public doctorService: DoctorService,
  ){}

  // deleteIconFunc1(){
  //   this.deleteIcon1 = !this.deleteIcon1
  // }
  // deleteIconFunc2(){
  //   this.deleteIcon2 = !this.deleteIcon2
  // }
  
  ngOnInit(): void {
    // this.getSetting();
    this.getSettings();
    this.doctorService.closeMenuSidebar();
    
  }

  getSetting(){
    this.settingService.getSettingById({}).subscribe((resp:any)=>{
      console.log(resp);
    })
  }

  getSettings(){
    this.settingService.getAllSettings().subscribe((resp:any)=>{
      console.log(resp);
      this.settings= resp.settings.data;
      this.setting_selectedId= resp.settings.data[0].id;
    })
}

loadFile($event:any){
  if($event.target.files[0].type.indexOf("image")){
    this.text_validation = 'Solamente pueden ser archivos de tipo imagen';
    return;
  }
  this.text_validation = '';
  this.FILE_AVATAR = $event.target.files[0];
  let reader = new FileReader();
  reader.readAsDataURL(this.FILE_AVATAR);
  reader.onloadend = ()=> this.IMAGE_PREVISUALIZA = reader.result;
}


save(){

  // let data = {
  //   name: this.name,
  //   address: this.address,
  //   phone: this.phone,
  //   city: this.city,
  //   state:this.state,
  //   zip:this.zip,
  //   country: this.country
  // }

  let formData = new FormData();

  if(this.name){
    formData.append('name', this.name);
  }
  if(this.address){
    formData.append('address', this.address);
  }
  if(this.phone){
    formData.append('phone', this.phone);
  }
  if(this.city){
    formData.append('city', this.city);
  }
  if(this.state){
    formData.append('state', this.state);
  }
  if(this.country){
    formData.append('country', this.country);
  }
  if(this.FILE_AVATAR){
    formData.append('imagen', this.FILE_AVATAR);
  }

  if(this.setting_selectedId){
    this.settingService.updateSetting(formData, this.setting_selectedId).subscribe((resp:any)=>{
      console.log(resp);
      Swal.fire('Actualizado', `Informacion Actualizada!`, 'success');
        this.ngOnInit();
        // location.reload();
    })
  }else{
    this.settingService.createSetting(formData).subscribe((resp:any)=>{
      // console.log(resp);
      this.getSettings();
       this.name= '';
       this.address= '';
       this.phone= '';
       this.city= '';
      this.state= '';
      this.zip= '';
       this.country = '';
       this.ngOnInit();
      //  location.reload();
    })
  }

  
}

deleteTipoPago(setting:any){debugger

  this.settingService.deleteSetting(setting.id).subscribe(
    (resp:any) =>{
      this.getSettings();
    });
  
}


}
