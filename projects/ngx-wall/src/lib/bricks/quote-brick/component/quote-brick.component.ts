import {Component} from '@angular/core';
import {BaseTextBrickComponent} from '../../base-text-brick/base-text-brick.component';

@Component({
    selector: 'quote-brick',
    templateUrl: './quote-brick.component.html',
    styleUrls: ['./quote-brick.component.scss']
})
export class QuoteBrickComponent extends BaseTextBrickComponent {
    placeholder = 'Quote';
}
