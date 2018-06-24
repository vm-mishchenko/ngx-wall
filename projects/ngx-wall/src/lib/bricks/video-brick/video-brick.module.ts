import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {StickyModalModule} from 'ngx-sticky-modal';
import {HelperComponentsModule} from '../../modules/helper-components';
import {BrickRegistry} from '../../wall';
import {InputContextComponent} from './component/input-context.component';
import {VideoBrickComponent} from './component/video-brick.component';
import {VideoBrickTextRepresentationClass} from './video-brick-text-representation.class';

@NgModule({
    imports: [
        CommonModule,
        StickyModalModule,
        HelperComponentsModule
    ],
    exports: [VideoBrickComponent],
    declarations: [VideoBrickComponent, InputContextComponent],
    entryComponents: [VideoBrickComponent, InputContextComponent]
})
export class VideoBrickModule {
    constructor(private brickRegistry: BrickRegistry) {
        this.brickRegistry.register({
            tag: 'video',
            component: VideoBrickComponent,
            textRepresentation: VideoBrickTextRepresentationClass,
            name: 'Video',
            description: 'Embed from Youtube and more'
        });
    }
}
