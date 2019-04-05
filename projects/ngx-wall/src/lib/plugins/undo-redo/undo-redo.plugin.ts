import {DOCUMENT} from '@angular/common';
import {Injector} from '@angular/core';
import {Subscription} from 'rxjs';
import {BeforeChangeEvent, IWallDefinition, IWallModel, IWallPlugin, SetPlanEvent} from '../../wall/wall';
import {IUndoRedoApi} from './undo-redo-api.interface';
import {UNDO_REDO_API_NAME} from './undo-redo.constant';

export class UndoRedoPlugin implements IWallPlugin {
    name: 'undoredo';
    version: '0.0.0';

    private wallModel: IWallModel;

    private doc: Document;

    private onUndoKeyHandlerBound: any;

    private apiSubscription: Subscription;

    private processingUndo = false;

    private undoPlanStack: IWallDefinition[] = [];
    private redoPlanStack: IWallDefinition[] = [];

    constructor(private injector: Injector) {
        this.doc = this.injector.get(DOCUMENT);
    }

    onWallInitialize(wallModel: IWallModel) {
        this.wallModel = wallModel;

        this.wallModel.registerApi(UNDO_REDO_API_NAME, {
            undo: this.undo.bind(this),
            undoSize: this.undoSize.bind(this),
            redo: this.redo.bind(this),
            redoSize: this.redoSize.bind(this),
            clear: this.clear.bind(this)
        } as IUndoRedoApi);

        this.apiSubscription = this.wallModel.api.core.subscribe((e) => {
            this.wallModelEventHandler(e);
        });

        this.onUndoKeyHandlerBound = this.onUndoKeyHandler.bind(this);

        this.doc.addEventListener('keydown', this.onUndoKeyHandlerBound);
    }

    onWallPluginDestroy() {
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

    private wallModelEventHandler(e: any): void {
        if (!this.processingUndo) {
            if (e instanceof BeforeChangeEvent && (e as BeforeChangeEvent).beforeEventType !== SetPlanEvent) {
                this.undoPlanStack.push(this.wallModel.api.core.getPlan());

                this.redoPlanStack = [];
            }
        }
    }

    private redo() {
        const redoPlan = this.redoPlanStack.pop();

        if (redoPlan) {
            this.processingUndo = true;

            this.wallModel.api.core.setPlan(redoPlan);

            this.undoPlanStack.push(redoPlan);

            this.processingUndo = false;
        }
    }

    private undo() {
        const previousPlan = this.undoPlanStack.pop();

        if (previousPlan) {
            this.processingUndo = true;

            this.wallModel.api.core.setPlan(previousPlan);

            this.redoPlanStack.push(previousPlan);

            this.processingUndo = false;
        }
    }

    private clear() {
        this.undoPlanStack = [];
        this.redoPlanStack = [];
    }
}
