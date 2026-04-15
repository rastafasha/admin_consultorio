import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TasabcvComponent } from './tasabcv.component';
import { TasabcvEditComponent } from './tasabcv-edit/tasabcv-edit.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ModalInstruccionesModule } from 'src/app/modales/modal-instrucciones.module';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { ReusablesModule } from 'src/app/reusables/reusables.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { TasabcvRoutingModule } from './tasabcv-routing.module';



@NgModule({ declarations: [
        TasabcvComponent,
        TasabcvEditComponent
    ], imports: [CommonModule,
        TasabcvRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        SharedModule,
        ReusablesModule,
        PipesModule,
        ModalInstruccionesModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class TasabcvModule { }
