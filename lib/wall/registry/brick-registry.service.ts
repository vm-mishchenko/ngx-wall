import { Injectable } from '@angular/core';
import { IBrickConfiguration, IBrickRegistry } from '../wall.interfaces';

@Injectable()
export class BrickRegistry implements IBrickRegistry {
    private bricks: any = [];

    register(brickConfiguration: IBrickConfiguration) {
        this.bricks.push(brickConfiguration);
    }

    get(tag: string) {
        return this.bricks.find((brickConfiguration: IBrickConfiguration) => brickConfiguration.tag === tag);
    }

    getAll() {
        return this.bricks;
    }
}