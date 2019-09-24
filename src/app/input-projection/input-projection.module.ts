import {NgModule} from '@angular/core';
import {NgxInputProjectionModule} from 'ngx-input-projection';
import {InputProjection} from './input-projection.component';

@NgModule({
  imports: [NgxInputProjectionModule],
  exports: [InputProjection],
  declarations: [InputProjection],
})
export class InputProjectionModule {
}
