import {Subject} from 'rxjs/Subject';
import {Injectable} from '@angular/core';
import {EndPickOut, PickOutItems, StartPickOut} from './pick-out.events';

@Injectable()
export class PickOutHandlerService {
    changes: Subject<any> = new Subject();

    private pickOutItems: Map<string, any> = new Map();

    registerPickOutItem(config: any) {
        this.pickOutItems.set(config.id, config);
    }

    unRegisterPickOutItem(id: string) {
        this.pickOutItems.delete(id);
    }

    startPickOut() {
        this.changes.next(new StartPickOut());
    }

    pickOutChanged(range) {
        const selectedItems = this.getSelectedItemIds(range);

        this.changes.next(new PickOutItems(selectedItems));
    }

    endPickOut() {
        this.changes.next(new EndPickOut());
    }

    private getSelectedItemIds(range) {
        const ids = [];

        this.pickOutItems.forEach((si) => {
            if (range.x < (si.x + si.width) &&
                (range.x + range.width) > si.x &&
                (range.y + range.height) > si.y &&
                range.y < (si.y + si.height)) {
                ids.push(si.id);
            }
        });

        return ids;
    }
}