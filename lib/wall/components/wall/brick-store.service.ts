import { Injectable } from '@angular/core';
import { BrickDefinition } from './wall.interfaces';
import { BrickStorage } from './brick-storage.class';

/**
 * @desc
 * Store all brick states
 * */
@Injectable()
export class BrickStore {
    bricks: BrickStorage[] = [];

    static getNewGuid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    initialize(brickDefinitions: BrickDefinition[]) {
        this.bricks = brickDefinitions.map((brickDefinition) => {
            return this.initializeBrickStorage(
                brickDefinition.id,
                brickDefinition.tag,
                brickDefinition.data,
                brickDefinition.meta
            );
        });
    }

    addBrick(tag: string) {
        const brickStorage = this.initializeBrickStorage(
            BrickStore.getNewGuid(),
            tag,
            {},
            {}
        );

        this.bricks.push(brickStorage);

        return brickStorage;
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
        const brickStorage = this.getBrickById(brickId);

        brickStorage.tag = newTag;
        brickStorage.updateState({});
    }

    getBricksCount() {
        return this.bricks.length;
    }

    getBrickById(brickId: string): BrickStorage {
        return this.bricks.find((brick) => {
            return brick.id === brickId;
        });
    }

    getBrickTagById(brickId: string): string {
        const brick = this.getBrickById(brickId);

        return brick.tag;
    }

    serialize() {
        return this.bricks.map((brick) => {
            return {
                id: brick.id,
                tag: brick.tag,
                data: brick.data,
                meta: brick.meta
            };
        });
    }

    updateBrickState(brickId: string, brickState: any) {
        const brickStorage = this.bricks.find((brick) => {
            return brick.id === brickId;
        });

        brickStorage.updateState(brickState);
    }

    reset() {
        this.bricks = [];
    }

    private initializeBrickStorage(id: string, tag: string, data: any, meta: any): BrickStorage {
        return new BrickStorage(id, tag, data, meta);
    }
}