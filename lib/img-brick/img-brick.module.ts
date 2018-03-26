import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ModalModule } from '../modules/modal';
import { ResizableModule } from '../modules/resizable';
import { BrickRegistry, HelperComponentsModule } from '../wall';
import { ImgBrickComponent } from './component/img-brick.component';
import { InputContextComponent } from './component/input-context.component';
import { ImgBrickTextRepresentation } from './img-brick-text-representation.class';

@NgModule({
    imports: [
        CommonModule,
        ModalModule,
        HelperComponentsModule,
        ResizableModule
    ],
    exports: [ImgBrickComponent],
    declarations: [ImgBrickComponent, InputContextComponent],
    entryComponents: [ImgBrickComponent, InputContextComponent]
})
export class ImgBrickModule {
    constructor(private brickRegistry: BrickRegistry) {
        this.brickRegistry.register({
            tag: 'image',
            component: ImgBrickComponent,
            textRepresentation: ImgBrickTextRepresentation,
            name: 'Image',
            description: 'Embed with a link'
        });
    }
}
