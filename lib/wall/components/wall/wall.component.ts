import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { IWallConfiguration, IWallDefinition } from '../../wall.interfaces';
import { WallController } from './wall.controller';
import { WallApi } from './wall-api.service';
import { WallModel } from './wall.model';
import { WallStore } from './wall-store.service';

@Component({
    selector: 'wall',
    templateUrl: './wall.component.html',
    styleUrls: ['./wall.component.scss'],
    providers: [
        WallApi,
        WallModel,
        WallStore,
        WallController
    ]
})
export class WallComponent implements OnInit, OnChanges {
    @Input() plan: IWallDefinition = null;
    @Input() configuration: IWallConfiguration = null;

    constructor(private wallController: WallController) {
    }

    onCanvasClick() {
        this.wallController.wallModel.addDefaultBrick();
    }

    ngOnInit() {
        // initialize plan
        this.wallController.initialize(this.plan, this.configuration);
    }

    ngOnChanges() {
    }
}