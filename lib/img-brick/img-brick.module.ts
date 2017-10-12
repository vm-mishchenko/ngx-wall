import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrickRegistry } from '../wall';
import { ImgBrickComponent } from './component/img-brick.component';

@NgModule({
    imports: [
        BrowserModule
    ],
    exports: [ImgBrickComponent],
    declarations: [ImgBrickComponent],
    entryComponents: [ImgBrickComponent]
})
export class ImgBrickModule {
    constructor(private brickRegistry: BrickRegistry) {
        this.brickRegistry.register({
            tag: 'img',
            component: ImgBrickComponent
        });
    }
}
