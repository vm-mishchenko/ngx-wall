import { Component, Input, OnInit } from '@angular/core';
import { WallApi } from '../../index';

@Component({
    selector: 'text-brick',
    templateUrl: './text-brick-component.component.html'
})
export class TextBrickComponent implements OnInit {
    @Input() id: string;

    constructor(private wallApi: WallApi) {
    }

    state: any = {};

    ngOnInit() {
        /*const store = this.wallApi.getBrickStore(this.id);

        this.state = store.get();

        this.updateState();

        store.set(this.state);*/
    }

    updateState() {
    }
}