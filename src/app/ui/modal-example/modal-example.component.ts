import {Component, Input} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
    template: `
        <div class="modal-header">
            <h4 class="modal-title">Hi there!</h4>

            <button (click)="activeModal.dismiss('Cross click')" type="button" class="btn btn-link w-btn">
                <span class="w-icon oi oi-x"></span>
            </button>
        </div>
        <div class="modal-body">
            <p>Hello, {{name}}!</p>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-outline-dark" (click)="activeModal.close('Close click')">Close</button>
        </div>
    `
})
export class ModalExampleComponent {
    @Input() name: any;

    constructor(public activeModal: NgbActiveModal) {
    }
}
