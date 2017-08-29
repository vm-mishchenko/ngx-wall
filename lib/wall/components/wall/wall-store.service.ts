import { Injectable } from '@angular/core';
import { IBrickDefinition } from '../../wall.interfaces';

@Injectable()
export class WallStore {
    bricks: any = null;

    initialize(bricks: IBrickDefinition[]) {
        this.bricks = bricks;
    }

    addBrick() {
    }

    serialize() {
        return this.bricks;
    }
}