import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {Radar} from '../radar/radar.service';
import {SpotModel} from '../radar/spot.model';

@Injectable()
export class PickOutService {
    pickOut$ = new Subject<string[]>();
    startPickOut$ = new Subject();
    endPickOut$ = new Subject();

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

    startPickOut() {
        this.startPickOut$.next();
    }

    pickOutChanged(range) {
        const pickOutSpotModels = Array.from(this.radar.spots.values())
            .filter((spot: SpotModel) => spot.clientData.isPickOutItem);

        this.pickOut$.next(this.getSelectedItemIds(range, pickOutSpotModels));
    }

    endPickOut() {
        this.endPickOut$.next();
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
