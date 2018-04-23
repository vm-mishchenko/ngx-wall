import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TextRepresentation } from '../base-text-brick/base-text-representation.class';
import { ContenteditableModule } from '../modules/contenteditable/contenteditable..module';
import { HelperComponentsModule } from '../modules/helper-components';
import { ModalModule } from '../modules/modal';
import { BrickRegistry } from '../wall';
import { BricksListComponent } from './bricks-list/bricks-list.component';
import { TextBrickComponent } from './component/text-brick.component';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        ContenteditableModule,
        HelperComponentsModule,
        ModalModule
    ],
    exports: [
        TextBrickComponent,
        BricksListComponent
    ],
    declarations: [
        TextBrickComponent,
        BricksListComponent
    ],
    entryComponents: [
        TextBrickComponent,
        BricksListComponent
    ]
})
export class TextBrickModule {
    constructor(private brickRegistry: BrickRegistry) {
        this.brickRegistry.register({
            tag: 'text',
            component: TextBrickComponent,
            supportText: true,
            textRepresentation: TextRepresentation,
            name: 'Text',
            description: 'Just start writing with plain text'
        });
    }
}
