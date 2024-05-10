import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PubComponent } from './pub.component';
import { PubListComponent } from './pub-list/pub-list.component';

const routes: Routes = [
  {path:'', component:PubComponent,
  children:[
    
    {
      path:'list', component:PubListComponent
    },
    
  ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicidadRoutingModule { }
