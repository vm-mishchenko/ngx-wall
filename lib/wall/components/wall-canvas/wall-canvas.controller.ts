import { WallCanvasApi } from './wall-canvas.api';
import { EventEmitter, Injectable } from '@angular/core';

@Injectable()
export class WallCanvasController {
    private canvasBrickInstances: any = {};
    private currentlyFocusedBrickId: string = null;

    onFocusedEvent: EventEmitter<any> = new EventEmitter();

    constructor(private wallCanvasApi: WallCanvasApi) {
        this.wallCanvasApi.core = {
            onFocused: this.onFocused.bind(this),
            registerCanvasBrickInstance: this.registerCanvasBrickInstance.bind(this)
        };
    }

    selectBricks(brickIds: string[]) {
        this.unselectBricks();

        brickIds.forEach((brickId) => {
            this.canvasBrickInstances[brickId].canvasBrickInstance.select();
        });
    }

    unselectBricks() {
        for (let brickId in this.canvasBrickInstances) {
            this.canvasBrickInstances[brickId].canvasBrickInstance.unselect();
        }
    }

    /*
     * Handler when user focused to some brick using mouse
     * Store focused brick id and pass it to wall model
     * */
    onFocused(brickId: string) {
        this.currentlyFocusedBrickId = brickId;

        this.onFocusedEvent.next(brickId);
    }

    focusBrickById(brickId: string) {
        if (this.currentlyFocusedBrickId !== brickId) {
            this.currentlyFocusedBrickId = brickId;

            if (this.canvasBrickInstances[brickId].brickInstance.onWallFocus) {
                this.canvasBrickInstances[brickId].brickInstance.onWallFocus();
            }
        }
    }

    // TODO: Temporary solution, particular brick should not unfocus themself, wall component itself should done it
    blurCurrentFocusedBrickId() {
        if (this.canvasBrickInstances[this.currentlyFocusedBrickId]) {
            if (this.canvasBrickInstances[this.currentlyFocusedBrickId].brickInstance.onWallUnFocus) {
                this.canvasBrickInstances[this.currentlyFocusedBrickId].brickInstance.onWallUnFocus();
            }
        }
    }

    clearFocusedBrickId() {
        this.blurCurrentFocusedBrickId();

        this.currentlyFocusedBrickId = null;
    }

    clearBrickInstances() {
        this.canvasBrickInstances = {};
    }

    registerCanvasBrickInstance(brickId: string, canvasBrickInstance: any, brickInstance: any) {
        this.canvasBrickInstances[brickId] = {
            brickInstance: brickInstance,
            canvasBrickInstance: canvasBrickInstance
        };
    }
}