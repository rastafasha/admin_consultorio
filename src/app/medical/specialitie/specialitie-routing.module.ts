import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SpecialitieComponent } from './specialitie.component';
import { ListSpecialitieComponent } from './list-specialitie/list-specialitie.component';
import { SpecialitieNComponent } from './specialitie-n/specialitie-n.component';
import { ListPatientSpecialitiesComponent } from './list-patient-specialities/list-patient-specialities.component';

const routes: Routes = [{
  path:'',
  component: SpecialitieComponent,
  children:[
    {
      path: 'specialitie-n',
      component: SpecialitieNComponent
    },
    {
      path: 'specialitie-n/:id',
      component: SpecialitieNComponent
    },
    {
      path: 'list',
      component: ListSpecialitieComponent
    },
    {
      path: 'list-specialities',
      component: ListPatientSpecialitiesComponent
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SpecialitieRoutingModule { }
