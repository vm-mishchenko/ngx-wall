import {Component, Input, OnChanges, OnDestroy, SimpleChanges} from '@angular/core';
import {WallViewModel} from './wall-view.model';
import {IWallModel} from '../../model/interfaces/wall-model.interface';
import {IWallConfiguration} from './interfaces/wall-configuration.interface';

@Component({
    selector: 'wall',
    templateUrl: './wall.component.html',
    styleUrls: ['./wall.component.scss'],
    providers: [
        WallViewModel
    ]
})
export class WallComponent implements OnChanges, OnDestroy {
    @Input() model: IWallModel = null;
    @Input() configuration: IWallConfiguration = null;

    constructor(public wallViewModel: WallViewModel) {
    }

    // click on empty space
    onCanvasClick() {
        this.wallViewModel.onCanvasClick();
    }

    onBrickStateChanged(event) {
        this.wallViewModel.onBrickStateChanged(event.brickId, event.brickState);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.model) {
            if (!changes.model.firstChange) {
                this.cleanUp();
            }

            this.initialize();
        }
    }

    ngOnDestroy() {
        this.cleanUp();
    }

    private initialize() {
        // initialize view model by business model
        this.wallViewModel.initialize(this.model);
    }

    private cleanUp() {
        this.wallViewModel.reset();
    }
}
