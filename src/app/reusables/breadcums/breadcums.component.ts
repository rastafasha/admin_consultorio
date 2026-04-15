import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-breadcums',
    templateUrl: './breadcums.component.html',
    styleUrls: ['./breadcums.component.scss'],
    standalone: false
})
export class BreadcumsComponent {
    @Input() titlePage
    @Input() routes
    // constructor () {}
}