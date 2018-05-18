import {Injectable} from '@angular/core';
import {BrickRegistry} from '../registry/brick-registry.service';
import {IWallDefinition} from '../wall.interfaces';
import {IWallModel} from './model.interfaces';
import {WallModel} from './wall.model';

@Injectable()
export class WallModelFactory {
    constructor(private brickRegistry: BrickRegistry) {
    }

    // todo after pass config with plugins to create method
    create(plan?: IWallDefinition): IWallModel {
        const defaultPlan = {
            bricks: [],
            layout: {
                bricks: []
            }
        };

        const defaultConfig = {
            plugins: []
        };

        const wallModel = new WallModel(
            this.brickRegistry,
            defaultConfig
        ) as any; // todo: remove after refactoring

        wallModel.setPlan(plan || defaultPlan);

        return wallModel;
    }
}
