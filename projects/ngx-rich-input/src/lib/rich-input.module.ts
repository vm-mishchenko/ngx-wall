import {NgModule} from '@angular/core';
import {StickyModalModule} from 'ngx-sticky-modal';
import {SelectionTextContextMenuComponent} from './components/selection-menu/selection-text-context-menu.component';
import {RichInputComponent} from './rich-input.component';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    StickyModalModule,
    MatButtonModule
  ],
  declarations: [
    RichInputComponent,
    SelectionTextContextMenuComponent,
  ],
  entryComponents: [
    SelectionTextContextMenuComponent
  ],
  exports: [
    RichInputComponent
  ]
})
export class RichInputModule {
}
