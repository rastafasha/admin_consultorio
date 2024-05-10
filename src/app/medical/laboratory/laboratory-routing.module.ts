import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LaboratoryComponent } from './laboratory.component';
import { ListLaboratoryComponent } from './list-laboratory/list-laboratory.component';
import { EditLaboratoryComponent } from './edit-laboratory/edit-laboratory.component';

const routes: Routes = [
  {path:'', component:LaboratoryComponent,
  children:[
    {
      path:'list', component:ListLaboratoryComponent
    },
    {
      path:'edit/:id', component:EditLaboratoryComponent
    },
    // {
    //   path:'view/:id', component:LocationViewComponent
    // },
    
  ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LaboratoryRoutingModule { }
