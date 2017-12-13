import { Component } from '@angular/core';
import { PickOutAreaModel } from './pick-out-area.model';
import { PickOutModelDestroyEvent } from './pick-out-model-destroy.event';

@Component({
    templateUrl: './pick-out-area.component.html'
})
export class PickOutAreaComponent {
    pickOutAreaModel: PickOutAreaModel = null;

    initialize(pickOutAreaModel: PickOutAreaModel) {
        this.pickOutAreaModel = pickOutAreaModel;

        const subscription = this.pickOutAreaModel.changes.subscribe((e: any) => {
            if (e instanceof PickOutModelDestroyEvent) {
                subscription.unsubscribe();
            }
        });
    }
}
