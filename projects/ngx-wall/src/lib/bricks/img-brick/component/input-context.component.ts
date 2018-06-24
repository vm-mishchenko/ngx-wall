import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {StickyModalRef} from 'ngx-sticky-modal';

@Component({
    template: `
        <div class="w-context-panel w-brick-input">
            <div class="w-brick-input__header"></div>

            <div class="w-brick-input__body">
                <form (submit)="onSubmit($event)">
                    <div class="form-group w-form-group">
                        <input #src class="form-control w-input" placeholder="Paste the image link">
                    </div>

                    <div class="form-group w-form-group">
                        <button (click)="applyImageSrc()" type="button" class="btn btn-block btn-primary w-btn">
                            Add image
                        </button>
                    </div>
                </form>

                <p class="w-brick-input__description mb-2">
                    Add link or upload image
                </p>

                <div class="form-group">
                    <input accept="image/*" (change)="onFileChange($event)" type="file"
                           class="form-control-file btn w-btn">
                </div>
            </div>

            <div class="w-brick-input__footer"></div>
        </div>
    `
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
