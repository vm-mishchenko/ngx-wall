import { Injectable } from '@angular/core';
import { BrickSpecification } from '../wall.interfaces';

@Injectable()
export class BrickRegistry {
    private bricks: BrickSpecification[] = [];

    register(brickConfiguration: BrickSpecification) {
        console.log(`${brickConfiguration.tag} is regisytered`);

        this.bricks.push(brickConfiguration);
    }

    get(tag: string): BrickSpecification {
        return this.bricks.find((brickConfiguration: BrickSpecification) => brickConfiguration.tag === tag);
    }

    getAll(): BrickSpecification[] {
        return this.bricks;
    }
}