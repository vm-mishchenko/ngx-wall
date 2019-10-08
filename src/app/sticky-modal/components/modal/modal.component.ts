import {Component, Inject, OnInit} from '@angular/core';
import {StickyModalRef, STICKY_MODAL_DATA} from 'ngx-sticky-modal';

@Component({
    selector: 'app-menu',
    templateUrl: 'app-modal.component.html',
    styleUrls: ['app-modal.component.scss']
})
export class ModalComponent implements OnInit {
    constructor(private ngxStickyModalRef: StickyModalRef,
                @Inject(STICKY_MODAL_DATA) public data: any) {
    }

    ngOnInit() {
    }

    close() {
        this.ngxStickyModalRef.close();
    }
}
