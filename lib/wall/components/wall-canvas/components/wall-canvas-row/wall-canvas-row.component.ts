import { Component, Input } from '@angular/core';

@Component({
    selector: 'wall-canvas-row',
    templateUrl: './wall-canvas-row.component.html'
})
export class WallCanvasRowComponent {
    @Input() row: any;

    trackColumnsBy(index): number {
        return index;
    }

    trackBricksBy(index, item) {
        return item.hash;
    }
}