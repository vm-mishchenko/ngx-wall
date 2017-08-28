import { Component, OnInit } from '@angular/core';
import { WallApi } from '../wall/wall-api.service';
import { WallCanvasController } from './wall-canvas.controller';

@Component({
    selector: 'wall-canvas',
    templateUrl: './wall-canvas-component.component.html',

    providers: [
        WallCanvasController
    ]
})

export class WallCanvasComponent implements OnInit {
    constructor(public wallApi: WallApi, private wallCanvasController: WallCanvasController) {
    }

    ngOnInit() {
        this.wallApi.addBrick();
    }
}