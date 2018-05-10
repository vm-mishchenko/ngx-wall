import {DOCUMENT} from '@angular/common';
import {Inject, Injectable} from '@angular/core';
import {Subscription} from 'rxjs';
import {WallApi} from '../../components/wall';
import {BeforeChangeEvent, SetPlanEvent} from '../../model/wall.events';
import {IPluginDestroy, IWallDefinition} from '../../wall.interfaces';
import {IUndoRedoApi} from './undo-redo-api.interface';

@Injectable()
export class UndoRedoPlugin implements IPluginDestroy {
    private doc: Document;

    private onUndoKeyHandlerBound: any;

    private apiSubscription: Subscription;

    private processingUndo: boolean = false;

    private undoPlanStack: IWallDefinition[] = [];
    private redoPlanStack: IWallDefinition[] = [];

    constructor(private wallApi: WallApi,
                @Inject(DOCUMENT) doc) {
        this.doc = doc;

        this.onUndoKeyHandlerBound = this.onUndoKeyHandler.bind(this);

        this.doc.addEventListener('keydown', this.onUndoKeyHandlerBound);

        this.wallApi.registerFeatureApi('undo', {
            undo: this.undo.bind(this),
            undoSize: this.undoSize.bind(this),
            redo: this.redo.bind(this),
            redoSize: this.redoSize.bind(this),
            clear: this.clear.bind(this)
        } as IUndoRedoApi);

        this.apiSubscription = this.wallApi.core.subscribe((e) => {
            this.wallApiHandler(e);
        });
    }

    onPluginDestroy() {
        this.apiSubscription.unsubscribe();

        this.doc.removeEventListener('keydown', this.onUndoKeyHandlerBound);
    }

    private onUndoKeyHandler(e: KeyboardEvent) {
        const CTRL_KEY = 90;

        if (e.keyCode === CTRL_KEY && e.ctrlKey) {
            e.preventDefault();
            e.stopPropagation();

            if (e.shiftKey) {
                this.redo();
            } else {
                this.undo();
            }
        }
    }

    private undoSize(): number {
        return this.undoPlanStack.length;
    }

    private redoSize(): number {
        return this.redoPlanStack.length;
    }

    private wallApiHandler(e: any): void {
        if (!this.processingUndo) {
            if (e instanceof BeforeChangeEvent && (e as BeforeChangeEvent).beforeEventType !== SetPlanEvent) {
                this.undoPlanStack.push(this.wallApi.core.getPlan());

                this.redoPlanStack = [];
            }
        }
    }

    private redo() {
        const redoPlan = this.redoPlanStack.pop();

        if (redoPlan) {
            this.processingUndo = true;

            this.wallApi.core.setPlan(redoPlan);

            this.undoPlanStack.push(redoPlan);

            this.processingUndo = false;
        }
    }

    private undo() {
        const previousPlan = this.undoPlanStack.pop();

        if (previousPlan) {
            this.processingUndo = true;

            this.wallApi.core.setPlan(previousPlan);

            this.redoPlanStack.push(previousPlan);

            this.processingUndo = false;
        }
    }

    private clear() {
        this.undoPlanStack = [];
        this.redoPlanStack = [];
    }
}
