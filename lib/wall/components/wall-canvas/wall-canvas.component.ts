import { DOCUMENT } from '@angular/common';
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
import { Subject } from 'rxjs/Subject';
import { Layout } from './interfaces/layout.interface';
import { FocusedBrick } from './wall-canvas.interfaces';


@Component({
    selector: 'wall-canvas',
    templateUrl: './wall-canvas-component.component.html'
})
export class WallCanvasComponent implements OnChanges {
    @Input() layout: Layout = {rows: []};

    @Input() selectedBricks: string[] = null;
    @Input() focusedBrick: FocusedBrick = null;
    @Input() isMediaInteractionEnabled: boolean = true;

    @Output() canvasClick: EventEmitter<any> = new EventEmitter();
    @Output() onFocusedBrick: EventEmitter<any> = new EventEmitter();
    @Output() onBrickStateChanged: EventEmitter<any> = new EventEmitter();

    // public API for sub components
    focusedBrick$: Subject<FocusedBrick> = new Subject();
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
        if (changes.focusedBrick) {
            if (!changes.focusedBrick.currentValue) {
                this.doc.activeElement.blur();
            } else {
                this.focusedBrick$.next(changes.focusedBrick.currentValue);
            }
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

    trackRowsBy(index, item): string {
        return item.id;
    }
}