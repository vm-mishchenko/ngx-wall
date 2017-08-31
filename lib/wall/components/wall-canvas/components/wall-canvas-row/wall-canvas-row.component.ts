import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'wall-canvas-row',
    templateUrl: './wall-canvas-row.component.html',
    styleUrls: ['./wall-canvas-row.component.scss']
})
export class WallCanvasRowComponent implements OnInit {
    @Input() row: any;

    constructor() {
    }

    ngOnInit() {
    }
}