import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LocationComponent } from './location.component';
import { LocationFormComponent } from './location-form/location-form.component';
import { LocationListComponent } from './location-list/location-list.component';
import { LocationViewComponent } from './location-view/location-view.component';

const routes: Routes = [
  {path:'', component:LocationComponent,
  children:[
    {
      path:'register', component:LocationFormComponent
    },
    {
      path:'list', component:LocationListComponent
    },
    {
      path:'list/edit/:id', component:LocationFormComponent
    },
    {
      path:'view/:id', component:LocationViewComponent
    },
    
  ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LocationRoutingModule { }

