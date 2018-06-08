import {Component} from '@angular/core';
import {BaseTextBrickComponent} from '../../base-text-brick/base-text-brick.component';

@Component({
    selector: 'quote-brick',
    templateUrl: './quote-brick.component.html'
})
export class QuoteBrickComponent extends BaseTextBrickComponent {
    placeholder = 'Quote';
}
