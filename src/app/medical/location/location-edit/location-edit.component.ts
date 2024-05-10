import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { routes } from 'src/app/shared/routes/routes';
import { LocationService } from '../services/location.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-location-edit',
  templateUrl: './location-edit.component.html',
  styleUrls: ['./location-edit.component.scss']
})
export class LocationEditComponent {
  public routes = routes;
  public location_id: any;
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
  
  public location_selected: any;
  
 
  public FILE_AVATAR:any;
  public IMAGE_PREVISUALIZA:any = 'assets/img/user-06.jpg';
  
  
  valid_form:boolean = false;
  valid_form_success:boolean = false;
  text_validation:any = null;
  text_success:any = null;
  
  
  constructor(
    public locationService:LocationService,
    public router: Router,
    public ativatedRoute: ActivatedRoute,

  ){

  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.ativatedRoute.params.subscribe((resp:any)=>{
      this.location_id = resp.id;
     })
     this.showLocation();
     this.getConfig();
  }

  getConfig(){
    this.locationService.listConfig().subscribe((resp:any)=>{
      console.log(resp);
    })
  }
  
showLocation(){
    this.locationService.getLocation(this.location_id).subscribe((resp:any)=>{
      console.log(resp);
      this.location_selected = resp.location;

      // this.selectedValueLocation = this.location_selected.locations.id;

        
        this.title = this.location_selected.title;
        this.email = this.location_selected.email;
        this.phone1 = this.location_selected.phone1;
        this.phone2 = this.location_selected.phone2;
        this.zip = this.location_selected.zip;
        this.email = this.location_selected.email;
        this.address = this.location_selected.address;
        this.city = this.location_selected.city;
        this.state = this.location_selected.state;
        this.IMAGE_PREVISUALIZA = this.location_selected.avatar;
    })
  }

  
  //files

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

//files
//update function
  save(){
    this.text_validation = '';
    if(!this.title ||!this.address  ){
      this.text_validation = 'Los campos con * son obligatorios';
      return;
    }


    // this.valid_form = false;
    let formData = new FormData();
    if(this.title ){
      formData.append('title', this.title);
    }
    if(this.phone1 ){
      formData.append('phone1', this.phone1);
    }
    if(this.phone2 ){
      formData.append('phone2', this.phone2);
    }
    if(this.address ){
      formData.append('address', this.address);
    }
    if(this.email ){
      formData.append('email', this.email);
    }
    if(this.zip ){
      formData.append('zip', this.zip);
    }
    if(this.city ){
      formData.append('city', this.city);
    }
    if(this.state ){
      formData.append('state', this.state);
    }
    
    if(this.FILE_AVATAR){
      formData.append('imagen', this.FILE_AVATAR);
    }

    this.valid_form_success = false;
    this.text_validation = '';

    this.locationService.editLocation(formData, this.location_id).subscribe((resp:any)=>{
      // console.log(resp);
      if(resp.message == 403){
        this.text_validation = resp.message_text;
      }else{
        // this.text_success = "El location se ha actualizado";
        Swal.fire('Updated', ` Location Has updated`, 'success');
        this.router.navigate(['/location/list']);
      }
    })


  }
//update function
}
