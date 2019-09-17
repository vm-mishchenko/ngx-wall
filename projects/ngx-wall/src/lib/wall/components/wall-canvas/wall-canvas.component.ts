import {DOCUMENT} from '@angular/common';
import {Component, ElementRef, EventEmitter, Inject, Input, Output, ViewChild} from '@angular/core';
import {Observable} from 'rxjs';
import {IWallModel} from '../../model/interfaces/wall-model.interface';
import {IViewBrickDefinition, IWallViewPlan, WallViewModel} from '../wall/wall-view.model';

@Component({
    selector: 'wall-canvas',
    templateUrl: './wall-canvas-component.component.html',
    styleUrls: ['./wall-canvas.component.scss']
})
export class WallCanvasComponent {
    @Input() wallModel: IWallModel;
    @Input() wallViewModel: WallViewModel;
    @Input() viewPlan: IWallViewPlan[] = [];

    @Input() isMediaInteractionEnabled$: Observable<boolean>;

    @Output() canvasClick: EventEmitter<any> = new EventEmitter();
    @Output() onBrickStateChanged: EventEmitter<any> = new EventEmitter();

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

    brickStateChanged(brickId: string, brickState: any) {
        this.onBrickStateChanged.emit({
            brickId,
            brickState
        });
    }

    trackByBrick(index, viewBrick: IViewBrickDefinition) {
        return `${viewBrick.brick.id}/${viewBrick.brick.tag}`;
    }
}
