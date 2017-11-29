import { Component } from '@angular/core';
import { WallApi } from "../../wall";
import { BaseTextBrickComponent } from "../../base-text-brick/base-text-brick.component";

@Component({
    selector: 'quote-brick',
    templateUrl: './quote-brick.component.html'
})
export class QuoteBrickComponent extends BaseTextBrickComponent {
    constructor(wallApi: WallApi) {
        super(wallApi);
    }
}