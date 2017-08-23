import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { IWallConfiguration, IWallPlan } from '../../wall.interfaces';
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
    @Input() plan: IWallPlan = null;
    @Input() configuration: IWallConfiguration = null;

    constructor(private wallController: WallController) {
    }

    onEditorClick(e: Event) {
        this.wallController.onEditorClick(e);
    }

    ngOnInit() {
        console.log(this.plan);
    }

    ngOnChanges() {
        console.log(this.configuration);
    }
}