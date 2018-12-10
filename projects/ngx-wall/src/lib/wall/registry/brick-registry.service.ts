import {Injectable} from '@angular/core';
import {IBrickSpecification} from './interfaces/brick-specification.interface';

@Injectable()
export class BrickRegistry {
    private bricks: IBrickSpecification[] = [];

    // todo: add unregister functionality

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
