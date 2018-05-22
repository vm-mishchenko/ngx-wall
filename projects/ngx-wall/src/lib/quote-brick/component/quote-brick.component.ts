import { Component } from '@angular/core';
import { BaseTextBrickComponent } from '../../base-text-brick/base-text-brick.component';
import { WallApi } from '../../wall';

@Component({
    selector: 'quote-brick',
    templateUrl: './quote-brick.component.html'
})
export class QuoteBrickComponent extends BaseTextBrickComponent {
    placeholder = 'Quote';

    constructor(wallApi: WallApi) {
        super(wallApi);
    }
}
