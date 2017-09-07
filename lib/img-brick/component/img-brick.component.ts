import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { onWallFocus, WallApi } from '../../index';

@Component({
    selector: 'img-brick',
    templateUrl: './img-brick.component.html'
})
export class ImgBrickComponent implements OnInit, onWallFocus {
    @Input() id: string;

    @ViewChild('src') src: ElementRef;

    state: any = {};

    store: any = null;

    constructor(private wallApi: WallApi) {
    }

    ngOnInit() {
        this.store = this.wallApi.core.getBrickStore(this.id);

        this.state = this.store.get();

        this.state.src = this.state.src || '';

        // this.src.nativeElement.value = this.state.src;
    }

    onWallFocus(): void {
        this.src.nativeElement.focus();
    }

    onKeyPress(e: any) {
        this.state.src = this.src.nativeElement.value;

        this.save();

        const ENTER_KEY = 13;

        if (e.keyCode === ENTER_KEY) {
            e.preventDefault();

            this.wallApi.core.addBrickAfterInNewRow(this.id, 'text');
        }
    }

    save() {
        this.store.set(this.state);
    }
}