import { NgModule } from '@angular/core';
import { BrickRegistry } from '../wall';
import { TextBrickComponent } from './component/text-brick.component';

@NgModule({
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
