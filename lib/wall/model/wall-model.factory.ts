import { Injectable } from '@angular/core';
import { IWallModel, WallDefinition } from '../wall.interfaces';
import { BrickRegistry } from '../registry/brick-registry.service';
import { WallModel } from './wall.model';


@Injectable()
export class WallModelFactory {
    constructor(private brickRegistry: BrickRegistry) {
    }

    create(plan?: WallDefinition): IWallModel {
        const modelPlan = plan || this.getDefaultPlan();

        const wallModel = new WallModel(this.brickRegistry);

        wallModel.initialize(modelPlan);

        return wallModel;
    }

    getDefaultPlan() {
        return {
            bricks: [],
            layout: {
                bricks: []
            }
        }
    }
}