import {Component} from '@angular/core';
import {BaseTextBrickComponent} from '../../base-text-brick/base-text-brick.component';

@Component({
    selector: 'header-brick',
    templateUrl: './header-brick.component.html',
    styleUrls: ['./header-brick.component.scss']
})
export class HeaderBrickComponent extends BaseTextBrickComponent {
    placeholder = 'Header';
}
