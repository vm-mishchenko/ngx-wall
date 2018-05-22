import {DOCUMENT} from '@angular/common';
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
import {Subject} from 'rxjs';
import {ILayout} from './interfaces/layout.interface';
import {IFocusedBrick} from './wall-canvas.interfaces';

@Component({
    selector: 'wall-canvas',
    templateUrl: './wall-canvas-component.component.html'
})
export class WallCanvasComponent implements OnChanges {
    @Input() layout: ILayout = {rows: []};

    @Input() selectedBricks: string[] = null;
    @Input() focusedBrick: IFocusedBrick = null;
    @Input() isMediaInteractionEnabled: boolean = true;

    @Output() canvasClick: EventEmitter<any> = new EventEmitter();
    @Output() onFocusedBrick: EventEmitter<any> = new EventEmitter();
    @Output() onBrickStateChanged: EventEmitter<any> = new EventEmitter();

    // public API for sub components
    focusedBrick$: Subject<IFocusedBrick> = new Subject();
    selectedBricks$: Subject<string[]> = new Subject();
    isMediaInteractionEnabled$: Subject<boolean> = new Subject();

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

    onFocused(brickId: string) {
        this.onFocusedBrick.emit(brickId);
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
            brickId,
            brickState
        });
    }

    trackRowsBy(index, item): string {
        return item.id;
    }
}
