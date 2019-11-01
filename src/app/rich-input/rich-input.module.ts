import {NgModule} from '@angular/core';
import {RichInputModule} from '../../../projects/ngx-rich-input/src/lib/rich-input.module';
import {RichInputComponent, RichInputEditAttrsComponent} from './rich-input.component';
import {StickyModalModule} from 'ngx-sticky-modal';

@NgModule({
  imports: [
    RichInputModule,
    StickyModalModule,
  ],
  declarations: [
    RichInputComponent,
    RichInputEditAttrsComponent,
  ],
  entryComponents: [
    RichInputEditAttrsComponent,
  ]
})
export class RichInputModuleExample {
}
