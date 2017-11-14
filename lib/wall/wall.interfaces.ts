// https://github.com/s-panferov/awesome-typescript-loader/issues/411

import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { EventEmitter } from '@angular/core';
import { WallBrick } from './model/wall-brick.model';

export const awesomeTypescriptLoaderBug2 = true;

// Register new brick
export interface BrickSpecification {
    tag: string;
    component: any;
    supportText?: true;
}

export interface WallDefinition {
    bricks: BrickDefinition[];
    layout: LayoutDefinition;
}

export interface BrickDefinition {
    id: string;
    tag: string;

    // user specific data
    data: {};

    meta: {
        comments?: any[]
    }
}

export interface LayoutDefinition {
    // todo rename to rows
    bricks: RowLayoutDefinition[];
}

export interface RowLayoutDefinition {
    columns: ColumnLayoutDefinition[];
}

export interface ColumnLayoutDefinition {
    bricks: { id: string }[];
}

export interface IWallComponent {
    id: string;
    state: BehaviorSubject<any>;
    stateChanges: EventEmitter<any>;
}

export interface IWallViewModel {
    canvasLayout: any;

    selectBrick(brickId: string): void;

    selectBricks(brickId: string[]): void;

    addBrickToSelection(brickId: string): void;

    removeBrickFromSelection(brickId: string): void;

    unSelectBricks(): void;

    onFocusedBrick(brickId: string): void;

    getSelectedBrickIds(): void;

    getFocusedBrickId(): string;

    isRegisteredBrick(tag: string): boolean;

    focusOnBrickId(brickId: string): void

    focusOnPreviousTextBrick(brickId: string): void;

    focusOnNextTextBrick(brickId: string): void;

    enableMediaInteraction(): void;

    disableMediaInteraction(): void;
}

export interface IWallModel {
    getNextBrickId(brickId: string): string;

    getNextTextBrickId(brickId: string): string;

    getPreviousTextBrickId(brickId: string): string;

    getPreviousBrickId(brickId: string): string;

    initialize(plan: WallDefinition);

    getPlan(): WallDefinition;

    updateBrickState(brickId, brickState): void;

    turnBrickInto(brickId: string, newTag: string);

    addDefaultBrick(): void;

    addBrickAfterBrickId(brickId: string, tag: string): void;

    moveBrickAfterBrickId(targetBrickIds: string[], beforeBrickId: string): void;

    moveBrickBeforeBrickId(targetBrickIds: string[], beforeBrickId: string): void;

    moveBrickToNewColumn(targetBrickIds: string[], beforeBrickId: string, side: string): void;

    removeBrick(brickId: string): void;

    removeBricks(brickIds): void;

    getBricksCount(): number;

    isBrickAheadOf(firstBrickId: string, secondBrickId: string): boolean;

    subscribe(fn: any): Subscription;

    traverse(fn: Function): void;

    filterBricks(predictor: Function): WallBrick[];

    getBrickIds(): string[];

    getBrickTag(brickId: string): string;
}