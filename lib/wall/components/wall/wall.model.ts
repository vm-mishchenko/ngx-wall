import { Injectable } from '@angular/core';
import { WallApi } from './wall-api.service';
import { ILayoutDefinition, IWallDefinition } from '../../wall.interfaces';
import { WallStore } from './wall-store.service';
import { WallCoreApi } from './wall-core-api.service';

/**
 * @desc Responsible for storing wall state.
 * Provide core functionality
 * */
@Injectable()
export class WallModel {
    layout: ILayoutDefinition;

    constructor(public api: WallApi, private brickStore: WallStore) {
    }

    initialize(plan: IWallDefinition) {
        this.layout = plan.layout;

        this.brickStore.initialize(plan.bricks);

        this.api.core = new WallCoreApi(this);

        // protect core API from extending
        Object.seal(this.api.core);
    }

    getPlan(): IWallDefinition {
        return {
            bricks: [],
            layout: {
                bricks: []
            }
        }
    }

    getBrickStore(brickId: string) {
        return this.brickStore.getBrickStore(brickId);
    }

    addDefaultBrick() {
        /*
        * Add brick to BrickStore
        * Add brick to LayoutStore
        * Trigger event
        * */
    }
}
