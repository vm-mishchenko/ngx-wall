import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {StickyModalModule} from 'ngx-sticky-modal';
import {VideoBrickTextRepresentationClass} from '../video-brick/video-brick-text-representation.class';
import {InputContextComponent} from './input-context/input-context.component';
import {WebBookmarkBrickComponent} from './component/web-bookmark-brick.component';
import {MatButtonModule, MatFormFieldModule, MatInputModule} from '@angular/material';
import {TowModule} from '../../modules/tow/tow.module';
import {HelperComponentsModule} from '../../modules/helper-components/helper-components.module';
import {BrickRegistry} from '../../wall/registry/brick-registry.service';

@NgModule({
    imports: [
        CommonModule,
        StickyModalModule,
        HelperComponentsModule,
        TowModule,
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule
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
