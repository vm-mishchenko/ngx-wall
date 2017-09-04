import { Injectable } from '@angular/core';
import { IBrickRegistry, IBrickSpecification } from '../wall.interfaces';

@Injectable()
export class BrickRegistry implements IBrickRegistry {
    private bricks: IBrickSpecification[] = [];

    register(brickConfiguration: IBrickSpecification) {
        this.bricks.push(brickConfiguration);
    }

    get(tag: string): IBrickSpecification {
        return this.bricks.find((brickConfiguration: IBrickSpecification) => brickConfiguration.tag === tag);
    }

    getAll(): IBrickSpecification[] {
        return this.bricks;
    }
}