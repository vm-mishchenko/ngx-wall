import {Component, Input} from '@angular/core';

@Component({
    selector: 'wall-canvas-row',
    templateUrl: './wall-canvas-row.component.html',
    styleUrls: ['./wall-canvas-row.component.scss']
})
export class WallCanvasRowComponent {
    @Input() row: any; // todo add type

    trackColumnsBy(index): number {
        return index;
    }

    trackBricksBy(index, item) {
        return item.hash;
    }
}
