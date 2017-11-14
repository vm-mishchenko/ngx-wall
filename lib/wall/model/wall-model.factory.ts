import { Injectable } from '@angular/core';
import { IWallModel, WallDefinition } from '../wall.interfaces';
import { BrickRegistry } from '../registry/brick-registry.service';
import { WallModel } from './wall.model';

@Injectable()
export class WallModelFactory {
    constructor(private brickRegistry: BrickRegistry) {
    }

    create(plan?: WallDefinition): IWallModel {
        const wallModel = new WallModel(this.brickRegistry);

        wallModel.initialize(plan || this.getDefaultPlan());

        return wallModel;
    }

    getDefaultPlan() {
        return {
            bricks: [],
            layout: {
                bricks: []
            }
        };
    }
}