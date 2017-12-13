import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrickRegistry } from '../wall/registry/brick-registry.service';
import { VideoBrickComponent } from './component/video-brick.component';

@NgModule({
    imports: [
        CommonModule
    ],
    exports: [VideoBrickComponent],
    declarations: [VideoBrickComponent],
    entryComponents: [VideoBrickComponent]
})
export class VideoBrickModule {
    constructor(private brickRegistry: BrickRegistry) {
        this.brickRegistry.register({
            tag: 'v',
            component: VideoBrickComponent
        });
    }
}
