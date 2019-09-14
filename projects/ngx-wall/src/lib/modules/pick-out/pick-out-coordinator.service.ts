import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {Radar} from '../radar/radar.service';
import {SpotModel} from '../radar/spot.model';
import {EndPickOut} from './events/end-pick-out.event';
import {PickOutItems} from './events/pick-out-items.event';
import {StartPickOut} from './events/start-pick-out.event';
import {StopPickOut} from './events/stop-pick-out.event';

/**
 * Notified when selection is started by the pick-out-area.directive.
 * Based on area coordinate calculates which spots are selected.
 */
@Injectable()
export class PickOutCoordinator {
    changes: Subject<any> = new Subject();

    private isPickOutAllowed = true;

    constructor(private radar: Radar) {
    }

    disablePickOut() {
        this.isPickOutAllowed = false;
    }

    enablePickOut() {
        this.isPickOutAllowed = true;
    }

    canPickOut(): boolean {
        return this.isPickOutAllowed;
    }

    stopPickOut() {
        this.changes.next(new StopPickOut());
    }

    startPickOut() {
        this.changes.next(new StartPickOut());
    }

    pickOutChanged(range) {
        const pickOutSpotModels = this.radar.filterSpots((spot: SpotModel) => spot.clientData.isPickOutItem);

        pickOutSpotModels.forEach((spotModel) => {
            spotModel.updateInfo();
        });

        this.changes.next(new PickOutItems(this.getSelectedItemIds(range, pickOutSpotModels)));
    }

    endPickOut() {
        this.changes.next(new EndPickOut());
    }

    private getSelectedItemIds(range, pickOutsItem: SpotModel[]): string[] {
        return pickOutsItem
            .filter((pickOutItem) => {
                return (range.x < (pickOutItem.position.x + pickOutItem.size.width) &&
                    (range.x + range.width) > pickOutItem.position.x &&
                    (range.y + range.height) > pickOutItem.position.y &&
                    range.y < (pickOutItem.position.y + pickOutItem.size.height));
            })
            .map((pickOutItem) => pickOutItem.clientData.brickId);
    }
}
