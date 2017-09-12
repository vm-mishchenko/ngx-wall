import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'selection-range',
    templateUrl: './selection-range.component.html',
    style: [`
        .selection-range {
            position: absolute;
            top: 0
        }
    `]
})

export class SelectionRange implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}