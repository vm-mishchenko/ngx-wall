import {NgModule} from '@angular/core';
import {RichInputModule} from 'ngx-rich-input';
import {LinkEditAttrsComponent, LinkOverviewComponent, RichInputComponent} from './rich-input.component';
import {StickyModalModule} from 'ngx-sticky-modal';

@NgModule({
  imports: [
    RichInputModule,
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
