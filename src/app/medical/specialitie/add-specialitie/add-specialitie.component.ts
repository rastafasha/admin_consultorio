import { Component } from '@angular/core';
import { SpecialitieService } from '../service/specialitie.service';
import { DoctorService } from '../../doctors/service/doctor.service';

@Component({
  selector: 'app-add-specialitie',
  templateUrl: './add-specialitie.component.html',
  styleUrls: ['./add-specialitie.component.scss']
})
export class AddSpecialitieComponent {

  name:string = '';
  price:number = 0;
  valid_form: boolean = false;
  valid_form_success: boolean = false;
  text_validation:any = null;
  constructor(
    public specialitieService: SpecialitieService,
    public doctorService: DoctorService,
  ) {
    
    
  }
  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.doctorService.closeMenuSidebar();
  }

  save(){
    this.valid_form = false;
    if(!this.name){
      this.valid_form = true;
      return;
    }
    let data = {
      name: this.name,
      price: this.price,
    };
    this.valid_form_success = false;
    this.text_validation = null;
    this.specialitieService.storeSpecialities(data).subscribe((resp:any) => {
      // console.log(resp);
      if(resp.message == 403){
        this.text_validation = resp.message_text;
      }else{
        this.name = '';
        this.price = 0;
        this.valid_form_success = true;
      }

    })
  }

}
