import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RolesComponent } from './roles.component';
import { ListRoleUserComponent } from './list-role-user/list-role-user.component';
import { RoleFormComponent } from './role-form/role-form.component';

const routes: Routes = [
  {path:'', component:RolesComponent,
  children:[
    {
      path: 'register', component: RoleFormComponent
    },
    {
      path: 'list', component: ListRoleUserComponent
    },
    {
      path: 'list/edit/:id', component: RoleFormComponent
    },
  ]  
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RolesRoutingModule { }
