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
    WALL_FILE_UPLOADER,
    WallModule,
    WebBookmarkBrickModule
} from 'ngx-wall';
import {FileUploaderService} from './file-uploader.service';

import {WallEditorComponent} from './wall-editor.component';

@NgModule({
    imports: [
        // core wall modules
        WallModule.forRoot(),
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
    ],
    providers: [
        {
            provide: WALL_FILE_UPLOADER,
            useClass: FileUploaderService
        }
    ]
})
export class WallEditorModule {
}
