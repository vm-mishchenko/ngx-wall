import {NgModule} from '@angular/core';

import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {StickyModalModule} from 'ngx-sticky-modal';
import {MatButtonModule} from '@angular/material';
import {ContextMenuComponent, LinkMenuComponent, ProseMirrorComponent} from './prose-mirror.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    StickyModalModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  exports: [
    ProseMirrorComponent
  ],
  declarations: [
    LinkMenuComponent,
    ContextMenuComponent,
    ProseMirrorComponent
  ],
  entryComponents: [
    LinkMenuComponent,
    ContextMenuComponent,
  ],

  providers: [],
})
export class ProseMirrorModule {
}

