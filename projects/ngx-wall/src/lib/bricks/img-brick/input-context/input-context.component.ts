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

    applyImageSrc() {
        this.notify({
            src: this.srcInput.nativeElement.value
        });
    }

    onFileChange(event: any) {
        this.notify({
            file: event.target.files[0]
        });
    }

    notify(data) {
        this.ngxStickyModalRef.close(data);
    }

    onSubmit(e) {
        e.preventDefault();

        this.applyImageSrc();
    }
}
