import {DOCUMENT} from '@angular/common';
import {Component, ElementRef, EventEmitter, Inject, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {IWallModel} from '../../model/interfaces/wall-model.interface';
import {IWallRow} from '../../model/interfaces/wall-row.interface';
import {IFocusedBrick} from '../wall/interfaces/focused-brick.interface';

@Component({
    selector: 'wall-canvas',
    templateUrl: './wall-canvas-component.component.html',
    styleUrls: ['./wall-canvas.component.scss']
})
export class WallCanvasComponent implements OnChanges {
    @Input() wallModel: IWallModel;
    @Input() rows: IWallRow[] = [];

    @Input() selectedBricks: string[] = null;
    @Input() focusedBrick: IFocusedBrick = null;
    @Input() isMediaInteractionEnabled$: Observable<boolean>;

    @Output() canvasClick: EventEmitter<any> = new EventEmitter();
    @Output() onBrickStateChanged: EventEmitter<any> = new EventEmitter();

    // public API for sub components
    focusedBrick$: Subject<IFocusedBrick> = new Subject();
    selectedBricks$: Subject<string[]> = new Subject();

    doc: any = null;

    @ViewChild('expander') expander: ElementRef;

    constructor(@Inject(DOCUMENT) doc) {
        this.doc = doc;
    }

    onEditorClick(e: any) {
        if (e.target === this.expander.nativeElement) {
            this.canvasClick.emit();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.focusedBrick && changes.focusedBrick.currentValue) {
            this.focusedBrick$.next(changes.focusedBrick.currentValue);
        }

        if (changes.selectedBricks) {
            this.selectedBricks$.next(changes.selectedBricks.currentValue || []);
        }
    }

    brickStateChanged(brickId: string, brickState: any) {
        this.onBrickStateChanged.emit({
            brickId,
            brickState
        });
    }

    trackRowsBy(index, item): string {
        return item.id;
    }
}
