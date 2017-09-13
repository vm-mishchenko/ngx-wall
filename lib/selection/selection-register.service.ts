import { EventEmitter, Injectable } from '@angular/core';

@Injectable()
export class SelectionRegister {
    itemsSelected: EventEmitter<any> = new EventEmitter();

    private selectionItems: any[] = [];

    private selectedItems: any[] = [];

    registerSelectionItem(config: any) {
        this.selectionItems.push(config);
    }

    startSelection() {
        console.log('startSelection');
    }

    selectionChanged(selectionRange) {
        this.selectedItems = this.getSelectedItemIds(selectionRange);

        this.itemsSelected.next(this.selectedItems);
    }

    endSelection() {
        console.log('endSelection');
    }

    private getSelectedItemIds(selectionRange) {
        const ids = [];

        this.selectionItems.forEach((si) => {
            if (selectionRange.x < (si.x + si.width) &&
                (selectionRange.x + selectionRange.width) > si.x &&
                (selectionRange.y + selectionRange.height) > si.y &&
                selectionRange.y < (si.y + si.height)) {
                ids.push(si.id);
            }
        });

        return ids;
    }
}