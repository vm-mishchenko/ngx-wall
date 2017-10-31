import { Injectable } from '@angular/core';
import { WallApi } from './wall-api.service';
import { BrickStore } from './brick-store.service';
import { LayoutStore } from './layout-store.service';
import { WALL } from './wall.constant';
import { WallEditorRegistry } from '../../wall-editor.registry';
import { Subject } from 'rxjs/Subject';
import { AddBrickEvent, RemoveBrickEvent, RemoveBricksEvent, UpdateBrickStateEvent } from './wall.events';
import { Subscription } from 'rxjs/Subscription';
import { WallDefinition } from './interfaces/wall-definition.interface';
import { BrickRegistry } from '../../registry/brick-registry.service';
import { ReactiveProperty, ReactiveReadOnlyProperty } from '../../../reactive-property';
import { WallState } from './interfaces/wall-state.interface';

/**
 * @desc Responsible for storing wall state.
 * Provide core functionality
 * */
@Injectable()
export class WallModel {
    id: string = String(Math.random());

    events: Subject<any> = new Subject();

    // UI
    focusedBrickId: string = null;

    selectedBricks: string[] = [];

    private writeState = {
        mode: new ReactiveProperty<string>(WALL.MODES.EDIT),
        isMediaInteractionEnabled: new ReactiveProperty<boolean>(true)
    };

    state: WallState = {
        mode: new ReactiveReadOnlyProperty(this.writeState.mode.getValue(), this.writeState.mode.valueChanged),
        isMediaInteractionEnabled: new ReactiveReadOnlyProperty(this.writeState.isMediaInteractionEnabled.getValue(), this.writeState.isMediaInteractionEnabled.valueChanged)
    };

    constructor(public api: WallApi,
                private brickStore: BrickStore,
                private brickRegistry: BrickRegistry,
                private wallEditorRegistry: WallEditorRegistry,
                private layoutStore: LayoutStore) {
    }

    get canvasLayout(): boolean {
        return this.layoutStore.canvasLayout;
    }

    initialize(plan: WallDefinition) {
        this.wallEditorRegistry.registerEditor(this.id, this);

        // initialize core API
        const coreApi = [
            'state',

            // SELECTION
            'getSelectedBrickIds',
            'selectBrick',
            'selectBricks',
            'addBrickToSelection',
            'removeBrickFromSelection',
            'unSelectBricks',

            // FOCUS
            'focusOnBrickId',
            'getFocusedBrickId',
            'focusOnPreviousTextBrick',
            'focusOnNextTextBrick',

            // ADD BRICK
            'addBrickAfterBrickId',

            // MOVE BRICK
            'moveBrickAfterBrickId',
            'moveBrickBeforeBrickId',
            'moveBrickToNewColumn',

            // REMOVE BRICK
            'removeBrick',
            'removeBricks',

            // NAVIGATION
            'getPreviousBrickId',
            'getNextBrickId',
            'isBrickAheadOf',

            // BEHAVIOUR
            'enableMediaInteraction',
            'disableMediaInteraction',

            // CLIENT
            'getPlan',
            'subscribe',

            // BRICk
            'isRegisteredBrick',
            'turnBrickInto'

        ].reduce((result, methodName) => {
            if (this[methodName].bind) {
                result[methodName] = this[methodName].bind(this);
            } else {
                result[methodName] = this[methodName];
            }

            return result;
        }, {});

        this.api.registerCoreApi(coreApi);

        // protect API from extending
        Object.seal(this.api.core);

        this.brickStore.initialize(plan.bricks);
        this.layoutStore.initialize(plan.layout);
    }

    /* SELECTION API */

    selectBrick(brickId: string): void {
        if (this.isFocusedEditor()) {
            this.selectedBricks = [brickId];
            this.focusedBrickId = null;
        }
    }

    selectBricks(brickIds: string[]) {
        this.selectedBricks = brickIds;
    }

    addBrickToSelection(brickId: string): void {
        this.selectedBricks = this.selectedBricks.slice(0);
        this.selectedBricks.push(brickId);
    }

    removeBrickFromSelection(brickId: string): void {
        const brickIdIndex = this.selectedBricks.indexOf(brickId);

        this.selectedBricks.splice(brickIdIndex, 1);

        this.selectedBricks = this.selectedBricks.slice(0);
    }

    unSelectBricks(): void {
        this.selectedBricks = [];
    }

    // callback for brick selected by user
    onFocusedBrick(brickId: string) {
        this.wallEditorRegistry.setFocusedEditor(this.id);

        this.focusedBrickId = brickId;

        this.unSelectBricks();
    }

    getSelectedBrickIds(): string[] {
        return this.selectedBricks;
    }

    getNextBrickId(brickId: string): string {
        return this.layoutStore.getNextBrickId(brickId);
    }

    getPreviousBrickId(brickId: string) {
        return this.layoutStore.getPreviousBrickId(brickId);
    }

    getPlan(): WallDefinition {
        return {
            bricks: this.brickStore.serialize(),
            layout: this.layoutStore.serialize()
        }
    }

    updateBrickState(brickId, brickState) {
        this.brickStore.updateBrickState(brickId, brickState);

        this.events.next(new UpdateBrickStateEvent(brickId, brickState));
    }

    turnBrickInto(brickId: string, newTag: string) {
        this.brickStore.turnBrickInto(brickId, newTag);
        this.layoutStore.updateCanvasLayout();

        this.focusOnBrickId(brickId);
    }

    isRegisteredBrick(tag: string) {
        return Boolean(this.brickRegistry.get(tag));
    }

    /* Add text brick to the bottom of wall in the new row */
    addDefaultBrick() {
        if (!this.brickStore.getBricksCount()) {
            this.addBrick('text', 0, 0, 0);
        } else {
            this.addBrickAtTheEnd('text');
        }
    }

    /* Add brick to existing row and existing column */
    addBrick(tag: string, targetRowIndex: number, targetColumnIndex: number, positionIndex: number) {
        if (this.layoutStore.isColumnExist(targetRowIndex, targetColumnIndex)) {
            const newBrick = this.brickStore.create(tag);

            this.layoutStore.addBrick(newBrick.id, targetRowIndex, targetColumnIndex, positionIndex);

            this.focusOnBrickId(newBrick.id);

            this.events.next(new AddBrickEvent(newBrick.id));
        }
    }

    /* Create new row and and put brick to it */
    addBrickToNewRow(tag: string, targetRowIndex: number) {
        const totalRowCount = this.layoutStore.getRowCount();
        const lastRowIndex = totalRowCount - 1;

        // user cannot create row in position more than last row index + 1
        if (targetRowIndex > (lastRowIndex + 1)) {
            targetRowIndex = lastRowIndex + 1;
        }

        const newBrick = this.brickStore.create(tag);

        this.layoutStore.addBrickToNewRow(newBrick.id, targetRowIndex);

        this.focusOnBrickId(newBrick.id);

        this.events.next(new AddBrickEvent(newBrick.id));
    }

    addBrickAfterInSameColumn(brickId: string, tag: string) {
        const brickPosition = this.layoutStore.getBrickPositionByBrickId(brickId);

        this.addBrick(tag, brickPosition.rowIndex, brickPosition.columnIndex, brickPosition.brickIndex + 1);
    }

    addBrickAfterInNewRow(brickId: string, tag: string) {
        const brickPosition = this.layoutStore.getBrickPositionByBrickId(brickId);

        this.addBrickToNewRow(tag, brickPosition.rowIndex + 1);
    }

    /**
     * @public
     * */
    addBrickAfterBrickId(brickId: string, tag: string) {
        const brickPosition = this.layoutStore.getBrickPositionByBrickId(brickId);
        const columnCount = this.layoutStore.getColumnCount(brickPosition.rowIndex);

        if (columnCount === 1) {
            this.addBrickAfterInNewRow(brickId, tag);
        } else if (columnCount > 1) {
            this.addBrickAfterInSameColumn(brickId, tag);
        }
    }

    /*
    * Add brick to the new row in the bottom of whole wall
    * */
    addBrickAtTheEnd(tag: string) {
        const isLastBrickEmptyText = this.isLastBrickEmptyText();

        if (tag === 'text' && isLastBrickEmptyText) {
            this.focusOnBrickId(isLastBrickEmptyText.id);
        } else {
            this.addBrickToNewRow(tag, this.layoutStore.getRowCount());
        }
    }

    /**
     * @public
     * */
    moveBrickAfterBrickId(targetBrickIds: string[], beforeBrickId: string) {
        if (targetBrickIds.indexOf(beforeBrickId) === -1) {
            const brickPosition = this.layoutStore.getBrickPositionByBrickId(beforeBrickId);
            const columnCount = this.layoutStore.getColumnCount(brickPosition.rowIndex);

            if (columnCount === 1) {
                this.moveBrickAfterInNewRow(targetBrickIds, beforeBrickId);
            } else {
                this.moveBrickAfterInSameColumn(targetBrickIds, beforeBrickId);
            }

            this.unSelectBricks();
        }
    }

    /**
     * @public
     * */
    moveBrickBeforeBrickId(targetBrickIds: string[], beforeBrickId: string) {
        if (targetBrickIds.indexOf(beforeBrickId) === -1) {
            const brickPosition = this.layoutStore.getBrickPositionByBrickId(beforeBrickId);
            const columnCount = this.layoutStore.getColumnCount(brickPosition.rowIndex);

            if (columnCount === 1) {
                this.moveBrickBeforeInNewRow(targetBrickIds, beforeBrickId);
            } else {
                this.moveBrickBeforeInSameColumn(targetBrickIds, beforeBrickId);
            }

            this.unSelectBricks();
        }
    }

    /**
     * @public
     * */
    moveBrickToNewColumn(targetBrickIds: string[], beforeBrickId: string, side: string) {
        if (targetBrickIds.indexOf(beforeBrickId) === -1) {
            this.layoutStore.moveBrickToNewColumn(targetBrickIds, beforeBrickId, side);

            this.unSelectBricks();
        }
    }

    removeBrick(brickId: string) {
        const isOnlyOneBrickEmptyText = this.isOnlyOneBrickEmptyText();

        if (isOnlyOneBrickEmptyText) {
            this.focusOnBrickId(isOnlyOneBrickEmptyText.id);
        } else {
            // should find next/prev brick before remove target brick
            const previousTextBrickId = this.layoutStore.getPreviousTextBrick(brickId);
            const nextTextBrickId = this.layoutStore.getNextTextBrick(brickId);

            this.brickStore.remove(brickId);
            this.layoutStore.removeBrick(brickId);

            if (previousTextBrickId) {
                this.focusOnBrickId(previousTextBrickId);
            } else if (nextTextBrickId) {
                this.focusOnBrickId(nextTextBrickId);
            }

            this.events.next(new RemoveBrickEvent(brickId));
        }
    }

    removeBricks(brickIds): void {
        const isOnlyOneBrickEmptyText = this.isOnlyOneBrickEmptyText();

        if (isOnlyOneBrickEmptyText) {
            this.focusOnBrickId(isOnlyOneBrickEmptyText.id);
        } else {
            brickIds = this.layoutStore.sortBrickIds(brickIds);

            // should find next/prev brick before remove target brick
            const previousTextBrickId = this.layoutStore.getPreviousTextBrick(brickIds[0]);
            const nextTextBrickId = this.layoutStore.getNextTextBrick(brickIds[brickIds.length - 1]);

            brickIds.forEach((brickId) => {
                this.brickStore.remove(brickId);
                this.layoutStore.removeBrick(brickId);
            });

            if (previousTextBrickId) {
                this.focusOnBrickId(previousTextBrickId);
            } else if (nextTextBrickId) {
                this.focusOnBrickId(nextTextBrickId);
            } else if (!this.brickStore.getBricksCount()) {
                this.addBrick('text', 0, 0, 0);
            }

            this.events.next(new RemoveBricksEvent(brickIds));
        }
    }

    isBrickAheadOf(firstBrickId: string, secondBrickId: string): boolean {
        return this.layoutStore.isBrickAheadOf(firstBrickId, secondBrickId);
    }

    getFocusedBrickId(): string {
        return this.focusedBrickId;
    }

    focusOnBrickId(brickId: string): void {
        this.focusedBrickId = null;

        // wait until new brick will be rendered
        setTimeout(() => {
            this.focusedBrickId = brickId;
        });
    }

    focusOnPreviousTextBrick(brickId: string) {
        const previousTextBrickId = this.layoutStore.getPreviousTextBrick(brickId);

        if (previousTextBrickId) {
            this.focusOnBrickId(previousTextBrickId);
        }
    }

    focusOnNextTextBrick(brickId: string) {
        const nextTextBrickId = this.layoutStore.getNextTextBrick(brickId);

        if (nextTextBrickId) {
            this.focusOnBrickId(nextTextBrickId);
        }
    }

    isFocusedEditor() {
        return this.wallEditorRegistry.isFocusedEditor(this.id);
    }

    subscribe(callback: any): Subscription {
        return this.events.subscribe(callback);
    }

    /**
     * @public
     * */
    enableMediaInteraction() {
        this.writeState.isMediaInteractionEnabled.setValue(true);
    };

    /**
     * @public
     * */
    disableMediaInteraction() {
        this.writeState.isMediaInteractionEnabled.setValue(false);
    };

    reset() {
        this.brickStore.reset();
        this.layoutStore.reset();

        this.focusedBrickId = null;

        this.unSelectBricks();
    }

    private moveBrickAfterInNewRow(targetBrickIds: string[], beforeBrickId: string) {
        this.layoutStore.moveBrickAfterInNewRow(targetBrickIds, beforeBrickId);
    }

    private moveBrickBeforeInNewRow(targetBrickIds: string[], beforeBrickId: string) {
        this.layoutStore.moveBrickBeforeInNewRow(targetBrickIds, beforeBrickId);
    }

    private moveBrickAfterInSameColumn(targetBrickIds: string[], beforeBrickId: string) {
        this.layoutStore.moveBrickAfterInSameColumn(targetBrickIds, beforeBrickId);
    }

    private moveBrickBeforeInSameColumn(targetBrickIds: string[], beforeBrickId: string) {
        this.layoutStore.moveBrickBeforeInSameColumn(targetBrickIds, beforeBrickId);
    }

    private isOnlyOneBrickEmptyText() {
        const brickLength = this.brickStore.getBricksCount();

        return brickLength === 1 ? this.isLastBrickEmptyText() : null;

    }

    // TODO: method should return boolean value
    private isLastBrickEmptyText() {
        const lastBrickId = this.layoutStore.getLastBrickId();

        if (lastBrickId) {
            const lastBrick = this.brickStore.getBrickStorageById(lastBrickId);

            if (lastBrick.tag === 'text' && !lastBrick.data['text']) {
                return lastBrick;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
}
