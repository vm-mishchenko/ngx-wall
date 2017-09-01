import { WallCanvasApi } from './wall-canvas.api';
import { Injectable } from '@angular/core';

@Injectable()
export class WallCanvasController {
    brickInstances: any = {};

    constructor(private wallCanvasApi: WallCanvasApi) {
        this.wallCanvasApi.core = {
            registerBrickInstance: this.registerBrickInstance.bind(this)
        };
    }

    focusBrickById(brickId: string) {
        if (this.brickInstances[brickId].onWallFocus) {
            this.brickInstances[brickId].onWallFocus();
        }
    }

    clearBrickInstances() {
        this.brickInstances = {};
    }

    registerBrickInstance(brickId: string, brickInstance: any) {
        this.brickInstances[brickId] = brickInstance;
    }
}