import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
    template: `
        <div class="w-context-panel w-brick-input">
            <div class="w-brick-input__header"></div>

            <div class="w-brick-input__body">
                <form (submit)="onSubmit($event)">
                    <div class="form-group w-form-group">
                        <input #src class="form-control w-input" placeholder="Paste in https://...">
                    </div>

                    <div class="form-group w-form-group">
                        <button (click)="applySrc()" type="button" class="btn btn-block btn-primary w-btn">
                            Create Bookmark
                        </button>
                    </div>
                </form>

                <p class="w-brick-input__description">
                    Create a visual bookmark from a link...
                </p>
            </div>

            <div class="w-brick-input__footer"></div>
        </div>
    `
})
export class InputContextComponent implements OnInit {
    @ViewChild('src') srcInput: ElementRef;

    constructor(public activeModal: NgbActiveModal) {
    }

    ngOnInit() {
        setTimeout(() => {
            this.srcInput.nativeElement.focus();
        }, 10);
    }

    applySrc() {
        this.activeModal.close({
            src: this.srcInput.nativeElement.value
        });
    }

    onSubmit(e) {
        e.preventDefault();

        this.applySrc();
    }
}
