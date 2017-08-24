import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { IWallConfiguration, IWallDefinition } from '../../wall.interfaces';
import { WallController } from './wall.controller';

@Component({
    selector: 'wall',
    templateUrl: './wall.component.html',
    styleUrls: ['./wall.component.scss'],
    providers: [
        WallController
    ]
})
export class WallComponent implements OnInit, OnChanges {
    @Input() plan: IWallDefinition = null;
    @Input() configuration: IWallConfiguration = null;

    constructor(private wallController: WallController) {
    }

    onEditorClick(e: Event) {
    }

    ngOnInit() {
        // initialize plan
        this.wallController.initialize(this.plan);
    }

    ngOnChanges() {
    }
}