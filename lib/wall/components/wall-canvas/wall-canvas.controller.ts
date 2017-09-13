import { WallCanvasApi } from './wall-canvas.api';
import { EventEmitter, Injectable } from '@angular/core';

@Injectable()
export class WallCanvasController {
    private canvasBrickInstances: any = {};

    private currentlyFocusedBrickId: string = null;

    private selectedBrickIds: string[] = [];

    onFocusedEvent: EventEmitter<any> = new EventEmitter();

    constructor(private wallCanvasApi: WallCanvasApi) {
        this.wallCanvasApi.core = {
            onFocused: this.onFocused.bind(this),
            registerCanvasBrickInstance: this.registerCanvasBrickInstance.bind(this)
        };
    }

    selectBricks(brickIds: string[]) {
        console.log(brickIds);

        const bricksForSelect = [];
        brickIds.forEach((brickId) => {
            if (this.selectedBrickIds.indexOf(brickId) === -1) {
                bricksForSelect.push(brickId);
            }
        });

        const bricksForUnSelect = [];
        this.selectedBrickIds.forEach((brickId) => {
            if (brickIds.indexOf(brickId) === -1) {
                bricksForUnSelect.push(brickId);
            }
        });

        this._selectBrickIds(bricksForSelect);
        this.unselecBrickIds(bricksForUnSelect);

        this.selectedBrickIds = brickIds.slice(0);
    }

    _selectBrickIds(brickIds) {
        setTimeout(() => {
            brickIds.forEach((brickId) => {
                this.canvasBrickInstances[brickId].canvasBrickInstance.select();
            });
        });
    }

    unselecBrickIds(brickIds) {
        setTimeout(() => {
            for (let brickId in this.canvasBrickInstances) {
                if (brickIds.indexOf(brickId) !== -1) {
                    this.canvasBrickInstances[brickId].canvasBrickInstance.unselect();
                }
            }
        });
    }

    unselectBricks() {
        this.selectedBrickIds = [];

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

    clearFocusedBrickId() {
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