import { Injectable } from '@angular/core';
import { WallApi } from './wall-api.service';
import { ILayoutDefinition, IWallDefinition } from '../../wall.interfaces';
import { WallStore } from './wall-store.service';
import { WallComponentApi } from './wall-component-api.service';

/*
* ViewModel - responsible for storing wall state
* */
@Injectable()
export class WallModel {
    layout: ILayoutDefinition;

    constructor(public api: WallApi, private brickStore: WallStore) {
    }

    initialize(plan: IWallDefinition) {
        this.layout = plan.layout;

        this.brickStore.initialize(plan.bricks);

        this.api.core = new WallComponentApi(this);

        // protect core API from extending
        Object.seal(this.api.core);
    }

    getPlan() {
        return {
            bricks: this.brickStore.serialize()
        };
    }

    addDefaultComponent() {
        this.api.core.events.next(this.getPlan());
    }
}
