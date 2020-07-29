import {NgModule} from '@angular/core';
import {RichInputModule} from 'ngx-rich-input';
import {LinkEditAttrsComponent, LinkOverviewComponent, RichInputComponent} from './rich-input.component';
import {StickyModalModule} from 'ngx-sticky-modal';
import {ProseMirrorModule} from 'ngx-wall';

@NgModule({
  imports: [
    RichInputModule,
    ProseMirrorModule,
    StickyModalModule,
  ],
  declarations: [
    RichInputComponent,
    LinkEditAttrsComponent,
    LinkOverviewComponent,
  ],
  entryComponents: [
    LinkEditAttrsComponent,
    LinkOverviewComponent,
  ]
})
export class RichInputModuleExample {
}
