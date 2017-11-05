import { Injectable } from '@angular/core';
import { WallApi } from '../components/wall/wall-api.service';
import { WALL } from '../components/wall/wall.constant';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { ReactiveProperty, ReactiveReadOnlyProperty } from '../../reactive-property';
import { WallState } from '../components/wall/interfaces/wall-state.interface';
import { IWallModel, IWallViewModel } from "../wall.interfaces";

@Injectable()
export class WallViewModel implements IWallViewModel {
    id: string = String(Math.random());

    // todo IWallModel
    wallModel: any = null;

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

    constructor(public api: WallApi) {
    }

    get canvasLayout(): boolean {
        return this.wallModel ? this.wallModel.layoutStore.canvasLayout : null;
    }

    /**
     * Wall View Model
     * */

    /* SELECTION API */

    selectBrick(brickId: string): void {
        this.selectedBricks = [brickId];
        this.focusedBrickId = null;
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

    onFocusedBrick(brickId: string) {
        this.focusedBrickId = brickId;

        this.unSelectBricks();
    }

    getSelectedBrickIds(): string[] {
        return this.selectedBricks;
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
        const previousTextBrickId = this.wallModel.layoutStore.getPreviousTextBrick(brickId);

        if (previousTextBrickId) {
            this.focusOnBrickId(previousTextBrickId);
        }
    }

    focusOnNextTextBrick(brickId: string) {
        const nextTextBrickId = this.wallModel.layoutStore.getNextTextBrick(brickId);

        if (nextTextBrickId) {
            this.focusOnBrickId(nextTextBrickId);
        }
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

    initialize(wallModel: IWallModel) {
        this.wallModel = wallModel;

        // initialize view core API
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
            if (this.wallModel[methodName] && this.wallModel[methodName].bind) {
                result[methodName] = this.wallModel[methodName].bind(this.wallModel);
            }

            if (this[methodName] && this[methodName].bind) {
                result[methodName] = this[methodName].bind(this);
            }

            return result;
        }, {});

        this.api.registerCoreApi(coreApi);

        // protect API from extending
        Object.seal(this.api.core);
    }

    /**
     * Wall Model
     * */

    subscribe(callback: any): Subscription {
        return this.events.subscribe(callback);
    }

    reset() {
        this.focusedBrickId = null;

        this.unSelectBricks();
    }
}
