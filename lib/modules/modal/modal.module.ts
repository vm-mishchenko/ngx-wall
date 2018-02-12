import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ContextModalComponent } from './context-modal.component';
import { ContextModalService } from './context-modal.service';

@NgModule({
    imports: [
        CommonModule,
        NgbModule
    ],
    exports: [],
    declarations: [
        ContextModalComponent
    ],
    entryComponents: [
        ContextModalComponent
    ],
    providers: [
        ContextModalService
    ]
})
export class ModalModule {
}
