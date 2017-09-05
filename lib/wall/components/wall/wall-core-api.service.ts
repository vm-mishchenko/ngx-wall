import { Subject } from 'rxjs/Subject';
import { WallModel } from './wall.model';
import { IWallDefinition } from '../../wall.interfaces';
import { Subscription } from 'rxjs/Subscription';

// TODO: need to implement IWallCoreApi interface

export class WallCoreApi {
    events: Subject<any> = new Subject();

    constructor(private wallModel: WallModel) {
    }

    /* SELECTION API */
    getSelectedBrickIds(): string[] {
        return this.wallModel.getSelectedBrickIds();
    }

    selectBrick(brickId: string): void {
        return this.wallModel.selectBrick(brickId);
    }

    unSelectBricks(): void {
        return this.wallModel.unSelectBricks();
    }

    focusOnBrickId(brickId: string): void {
        return this.wallModel.focusOnBrickId(brickId);
    }

    addBrickToSelection(brickId: string): void {
        return this.wallModel.addBrickToSelection(brickId);
    }

    removeBrickFromSelection(brickId: string): void {
        return this.wallModel.removeBrickFromSelection(brickId);
    }

    /* SELECTION API */

    isBrickAheadOf(firstBrickId: string, secondBrickId: string): boolean {
        return this.wallModel.isBrickAheadOf(firstBrickId, secondBrickId);
    }

    getPlan(): IWallDefinition {
        return this.wallModel.getPlan();
    }

    turnBrickInto(brickId: string, newTag: string) {
        return this.wallModel.turnBrickInto(brickId, newTag);
    }

    addDefaultBrick() {
        return this.wallModel.addDefaultBrick();
    }

    addBrick(tag: string, targetRowIndex: number, targetColumnIndex: number, positionIndex: number) {
        return this.wallModel.addBrick(tag, targetRowIndex, targetColumnIndex, positionIndex);
    }

    addBrickToNewRow(tag: string, targetRowIndex: number) {
        return this.wallModel.addBrickToNewRow(tag, targetRowIndex);
    }

    addBrickToNewColumn(tag: string, targetRowIndex: number, targetColumnIndex: number) {
        return this.wallModel.addBrickToNewColumn(tag, targetRowIndex, targetColumnIndex);
    }

    addBrickAfterInSameColumn(brickId: string, tag: string) {
        return this.wallModel.addBrickAfterInSameColumn(brickId, tag);
    }

    addBrickAfterInNewRow(brickId: string, tag: string) {
        return this.wallModel.addBrickAfterInNewRow(brickId, tag);
    }

    removeBrick(brickId: string) {
        return this.wallModel.removeBrick(brickId);
    }

    removeBricks(brickIds: string) {
        return this.wallModel.removeBricks(brickIds);
    }

    getPreviousBrickId(brickId: string): string {
        return this.wallModel.getPreviousBrickId(brickId);
    }

    getNextBrickId(brickId: string): string {
        return this.wallModel.getNextBrickId(brickId);
    }

    getBrickStore(brickId: string) {
        return this.wallModel.getBrickStore(brickId);
    }

    getFocusedBrickId(): string {
        return this.wallModel.getFocusedBrickId();
    }

    focusOnPreviousTextBrick(brickId: string) {
        this.wallModel.focusOnPreviousTextBrick(brickId);
    }

    focusOnNextTextBrick(brickId: string) {
        this.wallModel.focusOnNextTextBrick(brickId);
    }

    subscribe(callback): Subscription {
        return this.events.subscribe(callback);
    }
}