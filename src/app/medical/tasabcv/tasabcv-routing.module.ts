import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TasabcvComponent } from './tasabcv.component';
import { TasabcvEditComponent } from './tasabcv-edit/tasabcv-edit.component';

const routes: Routes = [
  {path:'', component:TasabcvComponent,
  children:[
    
    {
      path:'edit', component:TasabcvEditComponent
    },
    
  ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TasabcvRoutingModule { }
