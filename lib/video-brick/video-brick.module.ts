import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HelperComponentsModule } from '../modules/helper-components/helper-components.module';
import { BrickRegistry } from '../wall';
import { InputContextComponent } from './component/input-context.component';
import { VideoBrickComponent } from './component/video-brick.component';
import { VideoBrickTextRepresentationClass } from './video-brick-text-representation.class';

@NgModule({
    imports: [
        CommonModule,
        HelperComponentsModule
    ],
    exports: [VideoBrickComponent],
    declarations: [VideoBrickComponent, InputContextComponent],
    entryComponents: [VideoBrickComponent, InputContextComponent]
})
export class VideoBrickModule {
    constructor(private brickRegistry: BrickRegistry) {
        this.brickRegistry.register({
            tag: 'v',
            component: VideoBrickComponent,
            textRepresentation: VideoBrickTextRepresentationClass
        });
    }
}
