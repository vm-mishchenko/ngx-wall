import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { EndPickOut } from './events/end-pick-out.event';
import { PickOutItems } from './events/pick-out-items.event';
import { StartPickOut } from './events/start-pick-out.event';
import { StopPickOut } from './events/stop-pick-out.event';
import { PickItemPosition } from './interfaces/pick-item-posiiton';
import { IPickOutItemConfig } from './interfaces/pick-out-item-config.interface';

@Injectable()
export class PickOutCoordinator {
    changes: Subject<any> = new Subject();

    private pickOutItems: Map<string, IPickOutItemConfig> = new Map();

    private pickOutItemPositions: Map<string, PickItemPosition> = new Map();

    private isPickOutAllowed: boolean = true;

    registerPickOutItem(config: IPickOutItemConfig) {
        this.pickOutItems.set(config.id, config);
    }

    unRegisterPickOutItem(id: string) {
        this.pickOutItems.delete(id);
    }

    disablePickOut() {
        this.isPickOutAllowed = false;
    }

    enablePickOut() {
        this.isPickOutAllowed = true;
    }

    stopPickOut() {
        this.changes.next(new StopPickOut());
    }

    canPickOut(): boolean {
        return this.isPickOutAllowed;
    }

    startPickOut() {
        this.updatePickOutItemPositions();

        this.changes.next(new StartPickOut());
    }

    pickOutChanged(range) {
        const selectedItems = this.getSelectedItemIds(range);

        this.changes.next(new PickOutItems(selectedItems));
    }

    endPickOut() {
        this.changes.next(new EndPickOut());
    }

    private updatePickOutItemPositions() {
        this.pickOutItemPositions = new Map();

        this.pickOutItems.forEach((pickItem) => {
            this.pickOutItemPositions.set(pickItem.id, pickItem.api.getPosition());
        });
    }

    private getSelectedItemIds(range) {
        const ids = [];

        this.pickOutItemPositions.forEach((si, id) => {
            if (range.x < (si.x + si.width) &&
                (range.x + range.width) > si.x &&
                (range.y + range.height) > si.y &&
                range.y < (si.y + si.height)) {

                ids.push(id);
            }
        });

        return ids;
    }
}
