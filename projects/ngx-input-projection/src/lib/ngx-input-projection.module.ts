import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {
  CdkInputProjectionDef, CdkItem,
  CdkPanelItem, ItemRenderer,
  MainOutlet,
  NgxInputProjectionComponent
} from './ngx-input-projection.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    NgxInputProjectionComponent,
    CdkInputProjectionDef,
    MainOutlet,
    CdkPanelItem,
    CdkItem,
    ItemRenderer,
  ],
  exports: [
    NgxInputProjectionComponent,
    CdkInputProjectionDef,
    MainOutlet,
    CdkPanelItem,
    CdkItem,
  ],
  entryComponents: [
    ItemRenderer,
  ]
})
export class NgxInputProjectionModule { }
