import { Component, Inject, Input } from '@angular/core';
import {  Location } from '@angular/common';

@Component({
    selector: 'app-back-bottn',
    templateUrl: './backButtn.component.html',
    styleUrls: ['./backButtn.component.css']
})
export class BackButtnComponent {
    // private _location = Inject(Location)
    @Input() pageTitle!:string;
    
    constructor(private _location: Location) {}

    goBack() {
        this._location.back();
      }
}