import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaymentSettingsRoutingModule } from './payment-settings-routing.module';
import { PaymentSettingsComponent } from './payment-settings.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({ declarations: [
        PaymentSettingsComponent
    ], imports: [CommonModule,
        PaymentSettingsRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        SharedModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class PaymentSettingsModule { }
