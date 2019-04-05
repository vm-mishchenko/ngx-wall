import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {StickyModalModule} from 'ngx-sticky-modal';
import {TextRepresentation} from '../base-text-brick/base-text-representation.class';
import {BricksListComponent} from './bricks-list/bricks-list.component';
import {TextBrickComponent} from './component/text-brick.component';
import {TextContextMenuComponent} from './text-context-menu/text-context-menu.component';
import {MatButtonModule, MatFormFieldModule, MatInputModule, MatListModule} from '@angular/material';
import {HelperComponentsModule} from '../../modules/helper-components/helper-components.module';
import {ContenteditableModule} from '../../modules/contenteditable/contenteditable.module';
import {BrickRegistry} from '../../wall/registry/brick-registry.service';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        ContenteditableModule,
        HelperComponentsModule,
        StickyModalModule,
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule,
        MatListModule
    ],
    exports: [
        TextBrickComponent,
        BricksListComponent,
        TextContextMenuComponent
    ],
    declarations: [
        TextBrickComponent,
        BricksListComponent,

        // context menu
        TextContextMenuComponent
    ],
    entryComponents: [
        TextBrickComponent,
        BricksListComponent,

        // context menu
        TextContextMenuComponent
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
