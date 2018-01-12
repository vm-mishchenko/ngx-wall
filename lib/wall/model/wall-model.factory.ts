import { Injectable } from '@angular/core';
import { BrickRegistry } from '../registry/brick-registry.service';
import { IWallDefinition } from '../wall.interfaces';
import { IWallModel } from './model.interfaces';
import { WallModel } from './wall.model';

@Injectable()
export class WallModelFactory {
    constructor(private brickRegistry: BrickRegistry) {
    }

    create(plan?: IWallDefinition): IWallModel {
        const wallModel = new WallModel(this.brickRegistry);

        wallModel.setPlan(plan || this.getDefaultPlan());

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
