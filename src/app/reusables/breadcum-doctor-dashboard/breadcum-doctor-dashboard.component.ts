import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-breadcum-doctor-dashboard',
    templateUrl: './breadcum-doctor-dashboard.component.html',
    styleUrls: ['./breadcum-doctor-dashboard.component.scss']
})
export class BreadcumDoctorDashboardComponent {
    @Input() routes
    @Input() titlePage
}