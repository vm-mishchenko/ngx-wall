import { Injectable } from '@angular/core';
import { WallDefinition } from "../wall.interfaces";
import { BrickStore } from "../components/wall/brick-store.service";
import { LayoutStore } from "../components/wall/layout-store.service";
import { BrickRegistry } from "../registry/brick-registry.service";
import { Wall2Model } from "./wall2.model";

@Injectable()
export class WallModelFactory {
    constructor(private brickRegistry: BrickRegistry) {
    }

    create(plan: WallDefinition): any {
        const brickStore = new BrickStore();
        const layoutStore = new LayoutStore(this.brickRegistry, brickStore);

        const wallModel = new Wall2Model(
            brickStore,
            this.brickRegistry,
            layoutStore
        );

        wallModel.initialize(plan);

        return wallModel;
    }
}