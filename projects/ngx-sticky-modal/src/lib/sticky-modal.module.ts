import {OverlayModule} from '@angular/cdk/overlay';
import {NgModule} from '@angular/core';
import {StickyModalService} from './sticky-modal.service';

@NgModule({
    imports: [
        OverlayModule
    ],
    providers: [StickyModalService]
})
export class StickyModalModule {
}
