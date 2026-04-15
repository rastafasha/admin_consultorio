import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GeneralSettingsRoutingModule } from './general-settings-routing.module';
import { GeneralSettingsComponent } from './general-settings.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';


@NgModule({ declarations: [
        GeneralSettingsComponent
    ], imports: [CommonModule,
        GeneralSettingsRoutingModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class GeneralSettingsModule { }
