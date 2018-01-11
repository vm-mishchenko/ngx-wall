import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrickRegistry } from '../wall';
import { ImgBrickComponent } from './component/img-brick.component';
import { ImgBrickTextRepresentation } from './img-brick-text-representation.class';

@NgModule({
    imports: [CommonModule],
    exports: [ImgBrickComponent],
    declarations: [ImgBrickComponent],
    entryComponents: [ImgBrickComponent]
})
export class ImgBrickModule {
    constructor(private brickRegistry: BrickRegistry) {
        this.brickRegistry.register({
            tag: 'img',
            component: ImgBrickComponent,
            textRepresentation: ImgBrickTextRepresentation
        });
    }
}
