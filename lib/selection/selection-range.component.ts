import { Component } from '@angular/core';
import { RangeModelOnDestroy, SelectionRangeModel } from './selection-area.directive';

@Component({
    selector: 'selection-range',
    templateUrl: './selection-range.component.html'
})
export class SelectionRange {
    selectionRangeModel: SelectionRangeModel = null;

    initialize(selectionRangeModel: SelectionRangeModel) {
        this.selectionRangeModel = selectionRangeModel;

        const subscription = this.selectionRangeModel.subscribe((e: any) => {
            if (e instanceof RangeModelOnDestroy) {
                subscription.unsubscribe();
            }
        });
    }
}