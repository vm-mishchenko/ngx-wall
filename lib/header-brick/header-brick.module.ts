import { NgModule } from '@angular/core';
import { BrickRegistry } from '../wall';
import { HeaderBrickComponent } from './component/header-brick.component';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
    imports: [
        BrowserModule,
    ],
    exports: [HeaderBrickComponent],
    declarations: [HeaderBrickComponent],
    entryComponents: [HeaderBrickComponent]
})
export class HeaderBrickModule {
    constructor(private brickRegistry: BrickRegistry) {
        this.brickRegistry.register({
            tag: 'header',
            component: HeaderBrickComponent,
            supportText: true
        });
    }
}
