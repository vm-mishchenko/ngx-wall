import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {StickyModalRef} from 'ngx-sticky-modal';

@Component({
    templateUrl: './input-context.component.html',
    styleUrls: ['./input-context.component.scss']
})
export class InputContextComponent implements OnInit {
    @ViewChild('src') srcInput: ElementRef;

    constructor(private ngxStickyModalRef: StickyModalRef) {
    }

    ngOnInit() {
        setTimeout(() => {
            this.srcInput.nativeElement.focus();
        }, 10);
    }

    applySrc() {
        this.ngxStickyModalRef.close({
            src: this.srcInput.nativeElement.value
        });
    }

    onSubmit(e) {
        e.preventDefault();

        this.applySrc();
    }
}
