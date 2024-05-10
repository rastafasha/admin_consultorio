import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { routes } from 'src/app/shared/routes/routes';
import { DoctorService } from '../../doctors/service/doctor.service';
import { Location } from '@angular/common';
import { LocationService } from '../services/location.service';

@Component({
  selector: 'app-location-view',
  templateUrl: './location-view.component.html',
  styleUrls: ['./location-view.component.scss']
})
export class LocationViewComponent {
  public routes = routes;
  public selectedValue!: string;

  public title: string = '';


  public services:any = [];
  public patients:any = [];
  public specialists:any = [];
  public location_info: any;

  public code: any;
  public provider: any;
  public description: any;
  public unit_prize: any;
  public hourly_fee: any;
  public max_allowed: any;

  public location_id: any;
  public location_selected: any;


  valid_form:boolean = false;
  valid_form_success:boolean = false;

  public text_success:string = '';
  public text_validation:string = '';

  
  constructor(
    public doctorService:DoctorService,
    public locationService:LocationService,
    public router: Router,
    public activatedRoute: ActivatedRoute,
    private location: Location,
    
  ){

  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.doctorService.closeMenuSidebar();
    this.activatedRoute.params.subscribe((resp:any)=>{
      // console.log(resp);
      this.location_id = resp.id;
    });

    this.getLocation();
  }

  
  getLocation(){
    this.locationService.getLocation(this.location_id).subscribe((resp:any)=>{
      console.log(resp);
      this.location_selected = resp.location;

      this.location_info= this.location_selected.location;
      // this.title= this.location_selected.location.title;
      this.patients = resp.patients;
      this.specialists = resp.specialists;
      console.log(this.specialists);
      console.log(this.patients);

    })
  }


  goBack() {
    this.location.back(); // <-- go back to previous location on cancel
  }
}
