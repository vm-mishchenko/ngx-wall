import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContenteditableModule } from '../modules/contenteditable/contenteditable..module';
import { BrickRegistry } from '../wall';
import { TextBrickComponent } from './component/text-brick.component';

@NgModule({
    imports: [
        FormsModule,
        ContenteditableModule
    ],
    exports: [TextBrickComponent],
    declarations: [TextBrickComponent],
    entryComponents: [TextBrickComponent]
})
export class TextBrickModule {
    constructor(private brickRegistry: BrickRegistry) {
        this.brickRegistry.register({
            tag: 'text',
            component: TextBrickComponent,
            supportText: true
        });
    }
}
