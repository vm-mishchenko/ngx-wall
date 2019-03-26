import {NgModule} from '@angular/core';
import {StickyModalModule} from 'ngx-sticky-modal';
import {HelperComponentsModule} from '../../modules/helper-components';
import {BrickRegistry, WallModule} from '../../wall';
import {CodeBrickComponent} from './component/code-brick.component';
import {ModeListComponent} from './mode-list/mode-list.component';
import {MatButtonModule, MatListModule} from '@angular/material';
import {CommonModule} from '@angular/common';

@NgModule({
    imports: [
        CommonModule,
        WallModule,
        HelperComponentsModule,
        StickyModalModule,
        MatButtonModule,
        MatListModule
    ],
    declarations: [
        CodeBrickComponent,
        ModeListComponent
    ],
    entryComponents: [
        CodeBrickComponent,
        ModeListComponent
    ]
})
export class CodeBrickModule {
    constructor(private brickRegistry: BrickRegistry) {
        this.brickRegistry.register({
            tag: 'code',
            component: CodeBrickComponent,
            name: 'Code',
            description: 'Capture a code snippet'
        });
    }
}
