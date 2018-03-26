import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HelperComponentsModule } from '../modules/helper-components/helper-components.module';
import { TowModule } from '../modules/tow';
import { VideoBrickTextRepresentationClass } from '../video-brick/video-brick-text-representation.class';
import { BrickRegistry } from '../wall';
import { InputContextComponent } from './component/input-context.component';
import { WebBookmarkBrickComponent } from './component/web-bookmark-brick.component';

@NgModule({
    imports: [
        CommonModule,
        HelperComponentsModule,
        TowModule
    ],
    exports: [
        WebBookmarkBrickComponent
    ],
    declarations: [
        InputContextComponent,
        WebBookmarkBrickComponent
    ],
    entryComponents: [
        InputContextComponent,
        WebBookmarkBrickComponent
    ],
    providers: []
})
export class WebBookmarkBrickModule {
    constructor(private brickRegistry: BrickRegistry) {
        this.brickRegistry.register({
            tag: 'webbookmark',
            component: WebBookmarkBrickComponent,
            textRepresentation: VideoBrickTextRepresentationClass,
            name: 'Web Bookmark',
            description: 'Save a link as a visual bookmark'
        });
    }
}
