import {NgModule} from '@angular/core';
import {NgbModal, NgbModalModule, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {ModalExampleComponent} from './modal-example/modal-example.component';

import {UiComponent} from './ui.component';

@NgModule({
    imports: [
        NgbModule
    ],
    declarations: [
        ModalExampleComponent,
        UiComponent
    ],
    entryComponents: [
        ModalExampleComponent
    ],
    exports: [
        UiComponent
    ]
})
export class UiModule {
}
