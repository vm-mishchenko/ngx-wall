import {Component} from '@angular/core';
import {BaseTextBrickComponent} from '../../base-text-brick/base-text-brick.component';

@Component({
    selector: 'header-brick',
    templateUrl: './header-brick-component.component.html'
})
export class HeaderBrickComponent extends BaseTextBrickComponent {
    placeholder = 'Header';
}
