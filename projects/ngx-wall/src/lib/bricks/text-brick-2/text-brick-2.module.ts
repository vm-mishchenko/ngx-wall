import {NgModule} from '@angular/core';
import {TextBrick2Component} from './text-brick-2.component';
import {StickyModalModule} from 'ngx-sticky-modal';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material';
import {BrickRegistry} from '../../wall/registry/brick-registry.service';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    MatButtonModule,
    StickyModalModule
  ],
  entryComponents: [TextBrick2Component],
  exports: [
    TextBrick2Component
  ],
  declarations: [
    TextBrick2Component
  ],
  providers: [],
})
export class TextBrick2Module {
  constructor(private brickRegistry: BrickRegistry) {
    this.brickRegistry.register({
      tag: 'text2',
      component: TextBrick2Component,
      supportText: true,
      name: 'Text 2',
      description: 'Just start writing with plain text 2'
    });
  }
}
