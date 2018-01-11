import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TextRepresentation } from '../base-text-brick/base-text-representation.class';
import { ContenteditableModule } from '../modules/contenteditable/contenteditable..module';
import { BrickRegistry } from '../wall';
import { HeaderBrickComponent } from './component/header-brick.component';

@NgModule({
    imports: [
        FormsModule,
        ContenteditableModule
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
            supportText: true,
            textRepresentation: TextRepresentation
        });
    }
}
