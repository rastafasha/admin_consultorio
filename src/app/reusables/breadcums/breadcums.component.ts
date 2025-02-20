import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-breadcums',
    templateUrl: './breadcums.component.html',
    styleUrls: ['./breadcums.component.scss']
})
export class BreadcumsComponent {
    @Input() titlePage
    // constructor () {}
}