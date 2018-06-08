import {Component, Input} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {IListItem} from '../../../modules/helper-components/item-list';

@Component({
    selector: 'w-mode-list-component',
    templateUrl: './mode-list.component.html'
})
export class ModeListComponent {
    @Input() config: {
        modes: IListItem[];
    };

    constructor(public activeModal: NgbActiveModal) {
    }

    onSelected(mode: string) {
        this.activeModal.close(mode);
    }
}
