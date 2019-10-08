import {OverlayModule} from '@angular/cdk/overlay';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ModalComponent} from './components/modal/modal.component';
import {RelativeBtnComponent} from './components/relative-btn/relative-btn.component';
import {RelativeSelectionComponent} from './components/relative-selection/relative-selection.component';
import {StickyModalComponent} from './sticky-modal.component';

@NgModule({
  imports: [
    FormsModule,
    OverlayModule,
  ],
  declarations: [
    ModalComponent,
    RelativeBtnComponent,
    RelativeSelectionComponent,
    StickyModalComponent
  ],
  entryComponents: [
    ModalComponent
  ],
})
export class StickyModalModule {
}
