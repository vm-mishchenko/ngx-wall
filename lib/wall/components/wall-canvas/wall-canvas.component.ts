import {
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { WallCanvasApi } from './wall-canvas.api';
import { WallCanvasController } from './wall-canvas.controller';
import { Layout } from "./interfaces/layout.interface";

@Component({
    selector: 'wall-canvas',
    templateUrl: './wall-canvas-component.component.html',
    providers: [
        WallCanvasApi,
        WallCanvasController
    ]
})
export class WallCanvasComponent implements OnInit, OnChanges {
    @Input() layout: Layout = {rows: []};
    @Input() selectedBricks: string[] = null;
    @Input() focusedBrickId: string = null;
    @Input() isMediaInteractionEnabled: boolean = true;

    @Output() canvasClick: EventEmitter<any> = new EventEmitter();
    @Output() onFocusedBrick: EventEmitter<any> = new EventEmitter();

    doc: any = null;

    @ViewChild('expander') expander: ElementRef;

    constructor(private wallCanvasController: WallCanvasController,
                @Inject(DOCUMENT) doc) {
        this.doc = doc;

        this.wallCanvasController.onFocusedEvent.subscribe((brickId: string) => {
            this.onFocusedBrick.next(brickId);
        });
    }

    onEditorClick(e: any) {
        if (e.target === this.expander.nativeElement) {
            this.canvasClick.next();
        }
    }

    ngOnInit() {
        this.wallCanvasController.initialize();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.focusedBrickId) {
            if (changes.focusedBrickId.currentValue) {
                this.wallCanvasController.focusBrickById(changes.focusedBrickId.currentValue);
            } else {
                this.doc.activeElement.blur();

                this.wallCanvasController.clearFocusedBrickId();
            }
        }

        if (changes.selectedBricks) {
            if (changes.selectedBricks.currentValue.length) {
                this.wallCanvasController.selectBricks(changes.selectedBricks.currentValue);
            } else {
                this.wallCanvasController.unselectBricks();
            }
        }

        if (changes.isMediaInteractionEnabled) {
            if (changes.isMediaInteractionEnabled.currentValue) {
                this.wallCanvasController.enableMediaInteraction();
            } else {
                this.wallCanvasController.disableMediaInteraction();
            }
        }
    }

    trackBricksBy(index, item) {
        return JSON.stringify(item);
    }
}