import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ILayoutDefinition } from '../../wall.interfaces';

@Component({
    selector: 'wall-canvas',
    templateUrl: './wall-canvas-component.component.html',
    styleUrls: ['./wall-canvas.component.scss'],
    providers: []
})
export class WallCanvasComponent {
    @Input() layout: ILayoutDefinition;
    @Output() canvasClick: EventEmitter<any> = new EventEmitter();

    constructor() {
    }

    onCanvasClick() {
        this.canvasClick.next();
    }
}