import { Subscription } from "rxjs/Subscription";
import { WallState } from "./wall-state.interface";
import { WallDefinition } from "../../../wall.interfaces";
import { BrickSnapshot } from "../../../model/wall.events";
import { FocusContext } from "../wall.interfaces";

export interface WallCoreApi {
    state: WallState;

    // SELECTION API
    getSelectedBrickIds(): string[];

    selectBrick(brickId: string): void;

    selectBricks(brickIds: string[]): void;

    addBrickToSelection(brickId: string): void;

    removeBrickFromSelection(brickId: string): void

    unSelectBricks(): void;


    // FOCUS
    focusOnBrickId(brickId: string, focusContext?: FocusContext): void;

    getFocusedBrickId(): string;

    focusOnPreviousTextBrick(brickId: string, focusContext?: FocusContext);

    focusOnNextTextBrick(brickId: string, focusContext?: FocusContext);


    // ADD BRICK
    addBrickAfterBrickId(brickId: string, tag: string, state?: any): void;


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

    getPreviousTextBrickId(brickId: string): string;

    getNextTextBrickId(brickId: string): string;

    isBrickAheadOf(firstBrickId: string, secondBrickId: string): boolean


    // BEHAVIOUR
    enableMediaInteraction();

    disableMediaInteraction();


    // CLIENT
    getPlan(): WallDefinition;

    subscribe(callback: Function): Subscription;


    // BRICK
    isRegisteredBrick(tag: string): boolean;

    turnBrickInto(brickId: string, newTag: string): void;

    filterBricks(predictor: Function): BrickSnapshot[];

    updateBrickState(brickId: string, state: any): void;

    getBrickSnapshot(brickId: string): BrickSnapshot;
}