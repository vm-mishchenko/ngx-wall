import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatListModule, MatRippleModule} from '@angular/material';
import {
  CdkInputProjectionDef,
  CdkItem,
  CdkPanelItem,
  CdkPanelItemTitle,
  ItemRenderer,
  ListRenderer,
  MainOutlet,
  NgxInputProjectionComponent
} from './ngx-input-projection.component';

@NgModule({
  imports: [
    CommonModule,
    MatListModule,
    MatRippleModule,
  ],
  declarations: [
    NgxInputProjectionComponent,
    CdkInputProjectionDef,
    MainOutlet,
    CdkPanelItem,
    CdkItem,
    ListRenderer,
    ItemRenderer,
    CdkPanelItemTitle
  ],
  exports: [
    NgxInputProjectionComponent,
    CdkInputProjectionDef,
    MainOutlet,
    CdkPanelItem,
    CdkItem,
    CdkPanelItemTitle
  ],
  entryComponents: [
    ListRenderer,
  ]
})
export class NgxInputProjectionModule { }
