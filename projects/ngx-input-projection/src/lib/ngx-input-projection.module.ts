import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {
  CdkInputProjectionDef,
  CdkItem,
  CdkPanelItem,
  ItemRenderer,
  ListRenderer,
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
    ListRenderer,
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
    ListRenderer,
  ]
})
export class NgxInputProjectionModule { }
