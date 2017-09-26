import {Subject} from 'rxjs/Subject';
import {Injectable} from '@angular/core';
import {EndPickOut, PickOutItems, StartPickOut} from './pick-out.events';

export class PickItemPosition {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface PickItemApi {
    getPosition(): PickItemPosition;
}

export interface PickOutItemConfig {
    id: string;
    api: PickItemApi;
}

@Injectable()
export class PickOutHandlerService {
    changes: Subject<any> = new Subject();

    private pickOutItems: Map<string, PickOutItemConfig> = new Map();

    private pickOutItemPositions: Map<string, PickItemPosition> = new Map();

    registerPickOutItem(config: PickOutItemConfig) {
        this.pickOutItems.set(config.id, config);
    }

    unRegisterPickOutItem(id: string) {
        this.pickOutItems.delete(id);
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