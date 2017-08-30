import { Component, Input, OnInit } from '@angular/core';
import { WallApi } from '../../index';

@Component({
    selector: 'text-brick',
    templateUrl: './text-brick-component.component.html',
    styleUrls: ['./text-brick-component.component.scss']
})
export class TextBrickComponent implements OnInit {
    @Input() id: string;

    constructor(private wallApi: WallApi) {
    }

    state: any = {};

    onRemove() {
        this.wallApi.core.removeBrick(this.id);
    }

    ngOnInit() {
        const store = this.wallApi.core.getBrickStore(this.id);

        this.state = store.get();
    }
}