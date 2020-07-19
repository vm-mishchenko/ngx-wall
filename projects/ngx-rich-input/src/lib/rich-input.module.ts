import {NgModule} from '@angular/core';
import {StickyModalModule} from 'ngx-sticky-modal';
import {SelectionTextContextMenuComponent} from './components/selection-menu/selection-text-context-menu.component';
import {RichInputComponent} from './rich-input.component';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material';
import {ProseMirrorComponent} from './prose-mirror.component';

@NgModule({
  imports: [
    CommonModule,
    StickyModalModule,
    MatButtonModule
  ],
  declarations: [
    RichInputComponent,
    ProseMirrorComponent,
    SelectionTextContextMenuComponent,
  ],
  entryComponents: [
    SelectionTextContextMenuComponent
  ],
  exports: [
    ProseMirrorComponent,
    RichInputComponent
  ]
})
export class RichInputModule {
}
