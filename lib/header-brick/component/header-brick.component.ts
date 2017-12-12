import { Component } from '@angular/core';
import { BaseTextBrickComponent } from "../../base-text-brick/base-text-brick.component";
import { WallApi } from '../../wall';

@Component({
    selector: 'header-brick',
    templateUrl: './header-brick-component.component.html'
})
export class HeaderBrickComponent extends BaseTextBrickComponent {
    constructor(wallApi: WallApi) {
        super(wallApi);
    }
}