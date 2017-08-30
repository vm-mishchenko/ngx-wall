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

    state: any = {
        text: 'bla bla bla'
    };

    ngOnInit() {
        const store = this.wallApi.core.getBrickStore(this.id);

        this.state = store.get();

        this.updateState();

        store.set(this.state);

        store.subscribe(() => {
            console.log('State has been changed');
        });
    }

    updateState() {
        this.state.text = 'foo foo foo';
    }
}