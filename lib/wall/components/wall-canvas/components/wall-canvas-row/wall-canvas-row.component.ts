import { Component, Input } from '@angular/core';

@Component({
    selector: 'wall-canvas-row',
    templateUrl: './wall-canvas-row.component.html'
})
export class WallCanvasRowComponent {
    @Input() row: any;

    trackColumnsBy(index, item) {
        return item.bricks.reduce((result, brick) => {
            result += brick.hash;

            return result;
        }, '');
    }

    trackBricksBy(index, item) {
        return item.hash;
    }
}