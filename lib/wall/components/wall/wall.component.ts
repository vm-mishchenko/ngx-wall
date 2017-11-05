import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { WallConfiguration } from './wall.interfaces';
import { WallController } from './wall.controller';
import { WallApi } from './wall-api.service';
import { BrickStore } from './brick-store.service';
import { LayoutStore } from './layout-store.service';
import { IWallModel } from "../../wall.interfaces";
import { WallViewModel } from "../../model/wall-view.model";

@Component({
    selector: 'wall',
    templateUrl: './wall.component.html',
    providers: [
        WallApi,
        WallViewModel,
        BrickStore,
        LayoutStore,
        WallController
    ]
})
export class WallComponent implements OnChanges, OnDestroy {
    @Input() model: IWallModel = null;
    @Input() configuration: WallConfiguration = null;

    constructor(private wallController: WallController) {
    }

    onCanvasClick() {
        this.wallController.wallModel.addDefaultBrick();
    }

    // callback when user focused to some brick by mouse click
    onFocusedBrick(brickId: string) {
        this.wallController.wallModel.onFocusedBrick(brickId);
    }

    onBrickStateChanged(event) {
        this.wallController.wallModel.updateBrickState(event.brickId, event.brickState);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.model) {
            if (!changes.model.firstChange) {
                this.wallController.reset();
            }

            this.initialize();
        }
    }

    ngOnDestroy() {
        this.wallController.reset();
    }

    private initialize() {
        this.wallController.initialize(this.model, this.configuration);
    }
}
