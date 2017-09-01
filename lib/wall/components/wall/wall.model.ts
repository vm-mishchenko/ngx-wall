import { Injectable } from '@angular/core';
import { WallApi } from './wall-api.service';
import { IWallDefinition } from '../../wall.interfaces';
import { WallCoreApi } from './wall-core-api.service';
import { BrickStore } from './brick-store.service';
import { LayoutStore } from './layout-store.service';
import { AddBrickEvent } from './events/add-brick.event';
import { RemoveBrickEvent } from './events/remove-brick.event';

/**
 * @desc Responsible for storing wall state.
 * Provide core functionality
 * */
@Injectable()
export class WallModel {
    get canvasLayout(): boolean {
        return this.layoutStore.canvasLayout;
    }

    focusedBrickId: string = null;

    constructor(public api: WallApi,
                private brickStore: BrickStore,
                private layoutStore: LayoutStore) {
    }

    initialize(plan: IWallDefinition) {
        this.api.core = new WallCoreApi(this);

        // protect core API from extending
        Object.seal(this.api.core);

        this.brickStore.initialize(plan.bricks);
        this.layoutStore.initialize(plan.layout);
    }

    getPlan(): IWallDefinition {
        return {
            bricks: this.brickStore.serialize(),
            layout: this.layoutStore.serialize()
        }
    }

    getBrickStore(brickId: string) {
        return this.brickStore.getBrickStore(brickId);
    }

    addDefaultBrick() {
        this.addBrickAtTheEnd('text');
    }

    addBrick(tag: string, targetRowIndex: number, targetColumnIndex: number, positionIndex: number) {
        const newBrick = this.brickStore.addBrick(tag);

        this.layoutStore.addBrick(newBrick.id, targetRowIndex, targetColumnIndex, positionIndex);

        this.focusOnBrickId(newBrick.id);

        this.api.core.events.next(new AddBrickEvent());
    }

    addBrickAfter(brickId: string, tag: string) {
        const newBrick = this.brickStore.addBrick(tag);

        this.layoutStore.addBrickAfter(brickId, newBrick.id);

        this.focusOnBrickId(newBrick.id);

        this.api.core.events.next(new AddBrickEvent());
    }

    addBrickAtTheEnd(tag: string) {
        const isLastBrickEmptyText = this.isLastBrickEmptyText();

        if (tag === 'text' && isLastBrickEmptyText) {
            this.focusOnBrickId(isLastBrickEmptyText.id);
        } else {
            const newBrick = this.brickStore.addBrick(tag);

            this.layoutStore.addBrickAtTheEnd(newBrick.id);

            this.focusOnBrickId(newBrick.id);

            this.api.core.events.next(new AddBrickEvent());
        }
    }

    removeBrick(brickId: string) {
        const isOnlyOneBrickEmptyText = this.isOnlyOneBrickEmptyText();

        if (isOnlyOneBrickEmptyText) {
            this.focusOnBrickId(isOnlyOneBrickEmptyText.id);
        } else {
            const isBeforeTextBrick = this.isBeforeTextBrick(brickId);

            this.brickStore.removeBrick(brickId);
            this.layoutStore.removeBrick(brickId);

            if (isBeforeTextBrick) {
                this.focusOnBrickId(isBeforeTextBrick.id);
            }

            this.api.core.events.next(new RemoveBrickEvent());
        }
    }

    focusOnBrickId(brickId: string) {
        this.focusedBrickId = null;

        // wait until new brick will be rendered
        setTimeout(() => {
            this.focusedBrickId = brickId;
        });
    }

    private isOnlyOneBrickEmptyText() {
        const brickLength = this.brickStore.getBricksCount();

        return brickLength === 1 ? this.isLastBrickEmptyText() : null;

    }

    private isLastBrickEmptyText() {
        const lastBrickId = this.layoutStore.getLastBrickId();

        const lastBrick = this.brickStore.getBrickById(lastBrickId);

        if (lastBrick.tag === 'text' && !lastBrick.data['text']) {
            return lastBrick;
        } else {
            return false;
        }
    }

    private isBeforeTextBrick(brickId: string) {
        const beforeBrickId = this.layoutStore.getBeforeBrickId(brickId);

        if (beforeBrickId) {
            const beforeBrick = this.brickStore.getBrickById(beforeBrickId);

            return beforeBrick.tag === 'text' && beforeBrick;
        } else {
            return false;
        }
    }
}
