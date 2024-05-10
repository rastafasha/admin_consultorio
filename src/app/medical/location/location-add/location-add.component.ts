import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { routes } from 'src/app/shared/routes/routes';
import { DoctorService } from '../../doctors/service/doctor.service';
import { LocationService } from '../services/location.service';

@Component({
  selector: 'app-location-add',
  templateUrl: './location-add.component.html',
  styleUrls: ['./location-add.component.scss']
})
export class LocationAddComponent {

  public routes = routes;
  public client_id: any;
  public doctor_id: any;
  public selectedValueLocation!: string;
  
  public title: string = '';
  public phone1: string = '';
  public phone2: string = '';
  public zip: string = '';
  public state: string = '';
  public email: string = '';
  public city: any;
  public address: string = '';

  
 
  public FILE_AVATAR:any;
  public IMAGE_PREVISUALIZA:any = 'assets/img/user-06.jpg';
  
  
  valid_form:boolean = false;
  valid_form_success:boolean = false;
  text_validation:any = null;
  
  constructor(
    public locationService:LocationService,
    public doctorService:DoctorService,
    public router: Router,
  ){

  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.doctorService.closeMenuSidebar();
    this.getConfig();
  }

  getConfig(){
    this.locationService.listConfig().subscribe((resp:any)=>{
      console.log(resp);
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
    this.text_validation = '';
    if(!this.title ||!this.address  ){
      this.text_validation = 'Los campos con * son obligatorios';
      return;
    }
    

    // this.valid_form = false;
    let formData = new FormData();

    formData.append('title', this.title);
    formData.append('phone1', this.phone1);
    formData.append('phone2', this.phone2);
    formData.append('city', this.city);
    formData.append('state', this.state);
    formData.append('zip', this.zip);
    formData.append('address', this.address);
    formData.append('email', this.email);
    

    if(this.email){
      formData.append('email', this.email);
    }
    if(this.FILE_AVATAR){
      formData.append('imagen', this.FILE_AVATAR);
    }

    this.valid_form_success = false;
    this.text_validation = '';

    this.locationService.storeLocation(formData).subscribe((resp:any)=>{
      // console.log(resp);
      if(resp.message == 403){
        this.text_validation = resp.message_text;
      }else{
        this.router.navigate(['/location/list']);
        // this.ngOnInit();
      }
    })


  }
}
