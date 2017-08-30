import { Injectable } from '@angular/core';
import { IBrickDefinition } from '../../wall.interfaces';

// TODO: should implement IWallStore interface


// Simple naive implementation
class BrickItemStore {
    constructor(private brick: any) {
    }

    get() {
        return this.brick.data;
    }

    set(data: any) {
        this.brick.data = data;
    }
}

/**
 * @desc
 * Store all brick states
 * */
@Injectable()
export class BrickStore {
    bricks: IBrickDefinition[];

    initialize(bricks: IBrickDefinition[]) {
        this.bricks = bricks;
    }

    addBrick(tag: string) {
        const brick = {
            id: BrickStore.getNewGuid(),
            tag: tag,
            data: {},
            meta: {}
        };

        this.bricks.push(brick);

        return brick;
    }

    removeBrick(brickId: string) {
        let brickIndex;

        this.bricks.forEach((brick, index) => {
            if (brick.id === brickId) {
                brickIndex = index;
            }
        });

        this.bricks.splice(brickIndex, 1);
    }

    getBrickTagById(brickId: string) {
        const brick = this.bricks.find((brick) => {
            return brick.id === brickId;
        });

        return brick.tag;
    }

    serialize() {
        return this.bricks;
    }

    getBrickStore(brickId: string): any {
        const brick = this.bricks.find((brick) => {
            return brick.id === brickId;
        });

        return new BrickItemStore(brick);
    }

    static getNewGuid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }
}