import { Injectable } from '@angular/core';
import { BrickDefinition } from './wall.interfaces';


// Simple naive implementation
class BrickItemStore {
    constructor(private brick: any) {
    }

    get() {
        return this.cloneObject(this.brick.data);
    }

    set(data: any) {
        this.brick.data = data;
    }

    private cloneObject(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
}

/**
 * @desc
 * Store all brick states
 * */
@Injectable()
export class BrickStore {
    bricks: BrickDefinition[];

    initialize(bricks: BrickDefinition[]) {
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

    removeBrick(brickId: string): void {
        let brickIndex;

        this.bricks.forEach((brick, index) => {
            if (brick.id === brickId) {
                brickIndex = index;
            }
        });

        this.bricks.splice(brickIndex, 1);
    }

    turnBrickInto(brickId: string, newTag: string): void {
        const brick = this.getBrickById(brickId);

        brick.tag = newTag;
        brick.data = {};
    }

    getBricksCount() {
        return this.bricks.length;
    }

    getBrickById(brickId: string): BrickDefinition {
        return this.bricks.find((brick) => {
            return brick.id === brickId;
        });
    }

    getBrickTagById(brickId: string): string {
        const brick = this.getBrickById(brickId);

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