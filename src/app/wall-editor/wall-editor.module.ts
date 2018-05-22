import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {
  CodeBrickModule,
  DividerBrickModule,
  HeaderBrickModule,
  ImgBrickModule,
  PickOutModule,
  QuoteBrickModule,
  TextBrickModule,
  VideoBrickModule,
  WallModule,
  WebBookmarkBrickModule
} from 'ngx-wall';

import {WallEditorComponent} from './wall-editor.component';

@NgModule({
  imports: [
    // core wall modules
    WallModule,
    PickOutModule,

    // brick modules
    QuoteBrickModule,
    TextBrickModule,
    DividerBrickModule,
    VideoBrickModule,
    HeaderBrickModule,
    ImgBrickModule,
    WebBookmarkBrickModule,
    CodeBrickModule,

    // application level modules
    CommonModule
  ],
  declarations: [
    WallEditorComponent
  ]
})
export class WallEditorModule {
}
