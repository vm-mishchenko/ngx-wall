import { Injectable } from '@angular/core';
import { WallApi } from './wall-api.service';
import { ILayoutDefinition, IWallDefinition } from '../../wall.interfaces';
import { WallCoreApi } from './wall-core-api.service';
import { BrickStore } from './brick-store.service';
import { LayoutStore } from './layout-store.service';

/**
 * @desc Responsible for storing wall state.
 * Provide core functionality
 * */
@Injectable()
export class WallModel {
    layout: ILayoutDefinition;

    constructor(public api: WallApi,
                private brickStore: BrickStore,
                private layoutStore: LayoutStore) {
    }

    initialize(plan: IWallDefinition) {
        this.api.core = new WallCoreApi(this);

        // protect core API from extending
        Object.seal(this.api.core);

        this.brickStore.initialize(plan.bricks);
        this.layoutStore.initialize(plan.layout);
    }

    getCanvasLayout() {
        return this.layoutStore.getCanvasLayout();
    }

    getPlan(): IWallDefinition {
        return {
            bricks: this.brickStore.serialize(),
            layout: this.layoutStore.serialize()
        }
    }

    getBrickStore(brickId: string) {
        return this.brickStore.getBrickStore(brickId);
    }

    moveBrick(brickId: string, targetRowIndex: number, targetColumnIndex: number, positionIndex: number) {
    }

    addDefaultBrick() {
        this.addBrick('text', 0, 0, 0);
    }

    addBrick(tag: string, targetRowIndex: number, targetColumnIndex: number, positionIndex: number) {
        const newBrick = this.brickStore.addBrick(tag);

        this.layoutStore.addBrick(newBrick.id, targetRowIndex, targetColumnIndex, positionIndex);
    }

    removeBrick(brickId: string) {
        this.brickStore.removeBrick(brickId);
        this.layoutStore.removeBrick(brickId);
    }

}
