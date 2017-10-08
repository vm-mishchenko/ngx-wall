import { Subject } from 'rxjs/Subject';
import { Injectable } from '@angular/core';
import { EndPickOut, PickOutItems, StartPickOut, StopPickOut } from './pick-out.events';
import { PickOutItemConfig } from "./interfaces/pick-out-item-config.interface";
import { PickItemPosition } from "./interfaces/pick-item-posiiton";

@Injectable()
export class PickOutCoordinator {
    changes: Subject<any> = new Subject();

    private pickOutItems: Map<string, PickOutItemConfig> = new Map();

    private pickOutItemPositions: Map<string, PickItemPosition> = new Map();

    private isPickOutAllowed: boolean = true;

    registerPickOutItem(config: PickOutItemConfig) {
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