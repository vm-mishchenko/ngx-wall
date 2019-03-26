import {Component, Inject} from '@angular/core';
import {STICKY_MODAL_DATA, StickyModalRef} from 'ngx-sticky-modal';

export interface IModeListComponentConfig {
    modes: { value: string, name: string }[];
}

@Component({
    selector: 'w-mode-list-component',
    templateUrl: './mode-list.component.html'
})
export class ModeListComponent {
    constructor(@Inject(STICKY_MODAL_DATA) public config: IModeListComponentConfig,
                private ngxStickyModalRef: StickyModalRef) {
    }

    onSelected(mode: string) {
        this.ngxStickyModalRef.close(mode);
    }
}
