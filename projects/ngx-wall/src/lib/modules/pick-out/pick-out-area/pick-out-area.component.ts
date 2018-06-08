import {Component} from '@angular/core';
import {PickOutAreaModel} from './pick-out-area.model';

@Component({
    templateUrl: './pick-out-area.component.html'
})
export class PickOutAreaComponent {
    pickOutAreaModel: PickOutAreaModel = null;

    initialize(pickOutAreaModel: PickOutAreaModel) {
        this.pickOutAreaModel = pickOutAreaModel;
    }
}
