import { WallCanvasApi } from './wall-canvas.api';
import { EventEmitter, Injectable } from '@angular/core';
import { RemoveBrickEvent, WallApi } from '../wall';
import { RemoveBricksEvent } from '../../model/wall.events';

@Injectable()
export class WallCanvasController {
    onFocusedEvent: EventEmitter<any> = new EventEmitter();

    private canvasBrickInstances: Map<string, any> = new Map();
    private currentlyFocusedBrickId: string = null;
    private selectedBrickIds: string[] = [];

    constructor(private wallCanvasApi: WallCanvasApi,
                private wallApi: WallApi) {
    }

    initialize() {
        this.wallCanvasApi.core = {
            removeCanvasBrickInstance: this.removeCanvasBrickInstance.bind(this),
            onFocused: this.onFocused.bind(this),
            registerCanvasBrickInstance: this.registerCanvasBrickInstance.bind(this)
        };

        this.wallApi.core.subscribe((e) => {
            if (e instanceof RemoveBrickEvent) {
                this.removeCanvasBrickInstance(e.brick.id);
            }

            if (e instanceof RemoveBricksEvent) {
                e.bricks.forEach((removedBrick) => {
                    this.removeCanvasBrickInstance(removedBrick.id);
                });
            }
        });
    }

    selectBricks(brickIds: string[]) {
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
                this.canvasBrickInstances.get(brickId).canvasBrickInstance.select();
            });
        });
    }

    unselecBrickIds(brickIds) {
        setTimeout(() => {
            this.canvasBrickInstances.forEach((canvasBrickInstance, brickId) => {
                if (brickIds.indexOf(brickId) !== -1) {
                    canvasBrickInstance.canvasBrickInstance.unselect();
                }
            });
        });
    }

    unselectBricks() {
        this.selectedBrickIds = [];

        this.canvasBrickInstances.forEach((canvasBrickInstance, brickId) => {
            canvasBrickInstance.canvasBrickInstance.unselect();
        });
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

            if (this.canvasBrickInstances.get(brickId).brickInstance.onWallFocus) {
                this.canvasBrickInstances.get(brickId).brickInstance.onWallFocus();
            }
        }
    }

    clearFocusedBrickId() {
        this.currentlyFocusedBrickId = null;
    }

    clearBrickInstances() {
        this.canvasBrickInstances = new Map();
    }

    registerCanvasBrickInstance(brickId: string, canvasBrickInstance: any, brickInstance: any) {
        this.canvasBrickInstances.set(brickId, {
            brickInstance: brickInstance,
            canvasBrickInstance: canvasBrickInstance
        });
    }

    removeCanvasBrickInstance(brickId: string) {
        this.canvasBrickInstances.delete(brickId);
    }

    enableMediaInteraction() {
        this.canvasBrickInstances.forEach((canvasBrickInstance) => {
            canvasBrickInstance.canvasBrickInstance.enableMediaInteraction();
        });
    }

    disableMediaInteraction() {
        this.canvasBrickInstances.forEach((canvasBrickInstance) => {
            canvasBrickInstance.canvasBrickInstance.disableMediaInteraction();
        });
    }
}