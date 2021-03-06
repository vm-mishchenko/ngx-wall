import {Component, Input, OnChanges, OnDestroy, SimpleChanges} from '@angular/core';
import {IWallModel} from '../../model/interfaces/wall-model.interface';
import {IWallConfiguration} from './interfaces/wall-configuration.interface';
import {WallViewModel} from './wall-view.model';

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
