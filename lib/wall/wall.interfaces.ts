// https://github.com/s-panferov/awesome-typescript-loader/issues/411

import { EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { IBrickSnapshot } from './model/wall.events';

export const awesomeTypescriptLoaderBug2 = true;

export interface ITextRepresentation {
    getText(): string;
}

export interface ITextRepresentationConstructor {
    new (brickSnapshot: IBrickSnapshot): ITextRepresentation;
}

// Register new brick
export interface IBrickSpecification {
    tag: string;
    component: any;
    supportText?: boolean;
    textRepresentation?: ITextRepresentationConstructor;
}

export interface IWallDefinition {
    bricks: IBrickDefinition[];
    layout: ILayoutDefinition;
}

export interface IBrickDefinition {
    id: string;
    tag: string;

    // user specific data
    data: {};

    meta: {
        comments?: any[]
    };
}

export interface ILayoutDefinition {
    // todo rename to rows
    bricks: IRowLayoutDefinition[];
}

export interface IRowLayoutDefinition {
    columns: IColumnLayoutDefinition[];
}

export interface IColumnLayoutDefinition {
    bricks: Array<{ id: string }>;
}

export interface IWallComponent {
    id: string;
    state: BehaviorSubject<any>;
    stateChanges?: EventEmitter<any>;
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

    focusOnBrickId(brickId: string): void;

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

    initialize(plan: IWallDefinition);

    getPlan(): IWallDefinition;

    getRowCount(): number;

    getColumnCount(rowIndex: number): number;

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

    traverse(fn: (row: any) => any): void;

    filterBricks(predictor: () => any): IBrickSnapshot[];

    getBrickIds(): string[];

    getBrickTag(brickId: string): string;

    getBrickSnapshot(brickId: string): IBrickSnapshot;

    getBrickTextRepresentation(brickId: string): string;
}

export interface IPluginDestroy {
    onPluginDestroy();
}
