import {NgModule} from '@angular/core';
import {RichInputModule} from '../../../projects/ngx-rich-input/src/lib/rich-input.module';
import {RichInputComponent} from './rich-input.component';

@NgModule({
  imports: [RichInputModule],
  declarations: [RichInputComponent],
})
export class RichInputModuleExample {
}
