import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatRippleModule} from '@angular/material';
import {
  CdkInputProjectionDef,
  CdkPanelItem,
  CdkPanelItemTitle,
  ItemRenderer,
  ListRenderer,
  MainOutlet,
  InputProjectionComponent
} from './input-projection.component';

@NgModule({
  imports: [
    CommonModule,
    MatRippleModule,
  ],
  declarations: [
    InputProjectionComponent,
    CdkInputProjectionDef,
    MainOutlet,
    CdkPanelItem,
    ListRenderer,
    ItemRenderer,
    CdkPanelItemTitle
  ],
  exports: [
    InputProjectionComponent,
    CdkInputProjectionDef,
    MainOutlet,
    CdkPanelItem,
    CdkPanelItemTitle
  ],
  entryComponents: [
    ListRenderer,
  ]
})
export class NgxInputProjectionModule { }
