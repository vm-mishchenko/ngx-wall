import { Injectable } from '@angular/core';
import { BrickStorage } from './brick-storage.class';
import { BrickDefinition } from "../../wall.interfaces";

/**
 * @desc
 * Store all brick states
 * */
@Injectable()
export class BrickStore {
    brickStorages: BrickStorage[] = [];

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
        this.brickStorages = brickDefinitions.map((brickDefinition) => {
            return this.initializeBrickStorage(
                brickDefinition.id,
                brickDefinition.tag,
                brickDefinition.data,
                brickDefinition.meta
            );
        });
    }

    create(tag: string) {
        const brickStorage = this.initializeBrickStorage(
            BrickStore.getNewGuid(),
            tag,
            {},
            {}
        );

        this.brickStorages.push(brickStorage);

        return brickStorage;
    }

    remove(brickId: string): void {
        let brickIndex;

        this.brickStorages.forEach((brick, index) => {
            if (brick.id === brickId) {
                brickIndex = index;
            }
        });

        this.brickStorages.splice(brickIndex, 1);
    }

    turnBrickInto(brickId: string, newTag: string): void {
        const brickStorage = this.getBrickStorageById(brickId);

        brickStorage.tag = newTag;
        brickStorage.updateState({});
    }

    getBricksCount() {
        return this.brickStorages.length;
    }

    getBrickStorageById(brickId: string): BrickStorage {
        return this.brickStorages.find((brick) => {
            return brick.id === brickId;
        });
    }

    getBrickTagById(brickId: string): string {
        const brick = this.getBrickStorageById(brickId);

        return brick.tag;
    }

    serialize() {
        return this.brickStorages.map((brick) => {
            return {
                id: brick.id,
                tag: brick.tag,
                data: brick.data,
                meta: brick.meta
            };
        });
    }

    updateBrickState(brickId: string, brickState: any) {
        const brickStorage = this.getBrickStorageById(brickId);

        brickStorage.updateState(brickState);
    }

    reset() {
        this.brickStorages = [];
    }

    private initializeBrickStorage(id: string, tag: string, data: any, meta: any): BrickStorage {
        return new BrickStorage(id, tag, data, meta);
    }
}