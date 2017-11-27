import {
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Layout } from './interfaces/layout.interface';
import { Subject } from "rxjs/Subject";

@Component({
    selector: 'wall-canvas',
    templateUrl: './wall-canvas-component.component.html'
})
export class WallCanvasComponent implements OnChanges {
    @Input() layout: Layout = {rows: []};

    @Input() selectedBricks: string[] = null;
    @Input() focusedBrickId: string = null;
    @Input() isMediaInteractionEnabled: boolean = true;

    @Output() canvasClick: EventEmitter<any> = new EventEmitter();
    @Output() onFocusedBrick: EventEmitter<any> = new EventEmitter();
    @Output() onBrickStateChanged: EventEmitter<any> = new EventEmitter();

    // public API for sub components
    focusedBrickId$: Subject<string> = new Subject();
    selectedBricks$: Subject<string[]> = new Subject();
    isMediaInteractionEnabled$: Subject<boolean> = new Subject();

    doc: any = null;

    @ViewChild('expander') expander: ElementRef;

    constructor(@Inject(DOCUMENT) doc) {
        this.doc = doc;
    }

    onEditorClick(e: any) {
        if (e.target === this.expander.nativeElement) {
            this.canvasClick.next();
        }
    }

    onFocused(brickId: string) {
        this.onFocusedBrick.next(brickId);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.focusedBrickId) {
            if (!changes.focusedBrickId.currentValue) {
                this.doc.activeElement.blur();
            }

            this.focusedBrickId$.next(changes.focusedBrickId.currentValue);
        }

        if (changes.selectedBricks) {
            this.selectedBricks$.next(changes.selectedBricks.currentValue || []);
        }

        if (changes.isMediaInteractionEnabled) {
            this.isMediaInteractionEnabled$.next(changes.isMediaInteractionEnabled.currentValue);
        }
    }

    brickStateChanged(brickId: string, brickState: any) {
        this.onBrickStateChanged.emit({
            brickId: brickId,
            brickState: brickState
        });
    }

    trackBricksBy(index, item): string {
        return item.columns.reduce((result, column) => {
            result += column.bricks.reduce((brickResult, brick) => {
                brickResult += brick.hash;

                return brickResult;
            }, '');

            return result;
        }, '');
    }
}