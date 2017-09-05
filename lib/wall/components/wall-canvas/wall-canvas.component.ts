import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { WallCanvasApi } from './wall-canvas.api';
import { WallCanvasController } from './wall-canvas.controller';

@Component({
    selector: 'wall-canvas',
    templateUrl: './wall-canvas-component.component.html',
    styleUrls: ['./wall-canvas.component.scss'],
    providers: [
        WallCanvasApi,
        WallCanvasController
    ]
})
export class WallCanvasComponent implements OnChanges {
    @Input() layout: any = {bricks: []};
    @Input() selectedBricks: string[] = null;
    @Input() focusedBrickId: string = null;
    @Output() canvasClick: EventEmitter<any> = new EventEmitter();
    @Output() onFocusedBrick: EventEmitter<any> = new EventEmitter();

    @ViewChild('expander') expander: ElementRef;

    constructor(private wallCanvasController: WallCanvasController) {
        this.wallCanvasController.onFocusedEvent.subscribe((brickId: string) => {
            this.onFocusedBrick.next(brickId);
        });
    }

    onEditorClick(e: any) {
        if (e.target === this.expander.nativeElement) {
            this.canvasClick.next();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.focusedBrickId) {
            if(changes.focusedBrickId.currentValue){
                this.wallCanvasController.focusBrickById(changes.focusedBrickId.currentValue);
            } else{
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

        if (changes.layout && changes.layout.currentValue) {
            this.wallCanvasController.clearBrickInstances();
        }
    }
}