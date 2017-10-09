import { Subscription } from "rxjs/Subscription";
import { WallDefinition } from "./wall-definition.interface";

export interface WallCoreApi {
    // SELECTION API
    getSelectedBrickIds(): string[];

    selectBrick(brickId: string): void;

    selectBricks(brickIds: string[]): void;

    addBrickToSelection(brickId: string): void;

    removeBrickFromSelection(brickId: string): void

    unSelectBricks(): void;


    // FOCUS
    focusOnBrickId(brickId: string): void;

    getFocusedBrickId(): string;

    focusOnPreviousTextBrick(brickId: string);

    focusOnNextTextBrick(brickId: string);


    // ADD BRICK
    addBrickAfterBrickId(brickId: string, tag: string): void;


    // MOVE BRICK
    moveBrickAfterBrickId(targetBrickIds: string[], beforeBrickId: string);

    moveBrickBeforeBrickId(targetBrickIds: string[], beforeBrickId: string);

    moveBrickToNewColumn(targetBrickIds: string[], beforeBrickId: string, side: string);


    // REMOVE BRICK
    removeBrick(brickId: string)

    removeBricks(brickIds): void


    // NAVIGATION
    getPreviousBrickId(brickId: string): string;

    getNextBrickId(brickId: string): string;

    isBrickAheadOf(firstBrickId: string, secondBrickId: string): boolean


    // CLIENT
    getPlan(): WallDefinition;

    getMode(): string;

    subscribe(callback: Function): Subscription;


    // BRICK
    turnBrickInto(brickId: string, newTag: string): void;

    getBrickStore(brickId: string);
}