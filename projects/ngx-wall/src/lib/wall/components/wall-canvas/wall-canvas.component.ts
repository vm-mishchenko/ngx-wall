import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {IViewBrickDefinition, WallViewModel} from '../wall/wall-view.model';

@Component({
    selector: 'wall-canvas',
    templateUrl: './wall-canvas-component.component.html',
    styleUrls: ['./wall-canvas.component.scss'],
})
export class WallCanvasComponent {
    @Input() wallViewModel: WallViewModel;
    @ViewChild('expander') expander: ElementRef;

    onEditorClick(e: any) {
        if (e.target === this.expander.nativeElement) {
            this.wallViewModel.onCanvasClick();
        }
    }

    brickStateChanged(brickId: string, brickState: any) {
        this.wallViewModel.onBrickStateChanged(brickId, brickState);
    }

    trackByBrick(index, viewBrick: IViewBrickDefinition) {
        return `${viewBrick.brick.id}/${viewBrick.brick.tag}`;
    }
}
