import { Injectable } from '@angular/core';
import { IBrickRegistry, IBrickSpecification } from '../wall.interfaces';

@Injectable()
export class BrickRegistry implements IBrickRegistry {
    private bricks: any = [];

    register(brickConfiguration: IBrickSpecification) {
        this.bricks.push(brickConfiguration);
    }

    get(tag: string) {
        return this.bricks.find((brickConfiguration: IBrickSpecification) => brickConfiguration.tag === tag);
    }

    getAll() {
        return this.bricks;
    }
}