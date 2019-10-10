import {NgModule} from '@angular/core';
import {StickyModalModule} from 'ngx-sticky-modal';
import {SelectionMenuComponent} from './components/selection-menu/selection-menu.component';
import {RichInputComponent} from './rich-input.component';

@NgModule({
  imports: [
    StickyModalModule
  ],
  declarations: [
    RichInputComponent,
    SelectionMenuComponent,
  ],
  entryComponents: [
    SelectionMenuComponent
  ],
  exports: [
    RichInputComponent
  ]
})
export class RichInputModule { }
