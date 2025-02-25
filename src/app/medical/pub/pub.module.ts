import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicidadRoutingModule } from './pub-routing.module';
import { PubComponent } from './pub.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { PubListComponent } from './pub-list/pub-list.component';
import { ReusablesModule } from 'src/app/reusables/reusables.module';


@NgModule({
  declarations: [
    PubComponent,
    PubListComponent,
  ],
  exports: [
    PubComponent,
    PubListComponent,
  ],
  imports: [
    CommonModule,
    PublicidadRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    SharedModule,
    ReusablesModule
  ]
})
export class PubModule { }
