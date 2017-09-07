import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'wall-canvas-row',
    templateUrl: './wall-canvas-row.component.html'
})
export class WallCanvasRowComponent implements OnInit {
    @Input() row: any;

    constructor() {
    }

    ngOnInit() {
    }
}