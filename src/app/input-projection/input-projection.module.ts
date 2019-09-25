import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgxInputProjectionModule} from 'ngx-input-projection';
import {InputProjection} from './input-projection.component';

@NgModule({
  imports: [
    NgxInputProjectionModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [InputProjection],
  declarations: [InputProjection],
})
export class InputProjectionModule {
}
