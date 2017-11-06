import { Injectable } from '@angular/core';
import { IWallModel, WallDefinition } from '../wall.interfaces';
import { BrickStore } from '../components/wall/brick-store.service';
import { LayoutStore } from '../components/wall/layout-store.service';
import { BrickRegistry } from '../registry/brick-registry.service';
import { WallModel } from './wall.model';

@Injectable()
export class WallModelFactory {
    constructor(private brickRegistry: BrickRegistry) {
    }

    create(plan: WallDefinition): IWallModel {
        const brickStore = new BrickStore();
        const layoutStore = new LayoutStore(this.brickRegistry, brickStore);

        const wallModel = new WallModel(
            brickStore,
            layoutStore
        );

        wallModel.initialize(plan);

        return wallModel;
    }
}