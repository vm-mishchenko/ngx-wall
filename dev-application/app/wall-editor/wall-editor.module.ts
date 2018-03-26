import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
    DividerBrickModule,
    HeaderBrickModule,
    ImgBrickModule,
    PickOutModule,
    QuoteBrickModule,
    TextBrickModule,
    TowModule,
    VideoBrickModule,
    WallModule,
    WebBookmarkBrickModule
} from 'ngx-wall';

import { WallEditorComponent } from './wall-editor.component';

@NgModule({
    imports: [
        TowModule,
        PickOutModule,
        QuoteBrickModule,
        TextBrickModule,
        DividerBrickModule,
        VideoBrickModule,
        HeaderBrickModule,
        ImgBrickModule,
        WebBookmarkBrickModule,

        WallModule,

        CommonModule
    ],
    declarations: [
        WallEditorComponent
    ]
})
export class WallEditorModule {
}
