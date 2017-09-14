import { Injectable } from '@angular/core';
import { EndPickOut, PickOutItems, StartPickOut } from './pick-out.events';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class PickOutHandlerService {
    changes: Subject<any> = new Subject();

    private pickOutItems: any[] = [];

    registerPickOutItem(config: any) {
        console.log(config);

        this.pickOutItems.push(config);
    }

    startPickOut() {
        console.log('startPickOut');

        this.changes.next(new StartPickOut());
    }

    pickOutChanged(range) {
        console.log('pickOutChanged');

        const selectedItems = this.getSelectedItemIds(range);

        this.changes.next(new PickOutItems(selectedItems));
    }

    endPickOut() {
        console.log('endPickOut');

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