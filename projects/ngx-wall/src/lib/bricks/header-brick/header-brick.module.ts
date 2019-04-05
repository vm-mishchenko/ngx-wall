import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {TextRepresentation} from '../base-text-brick/base-text-representation.class';
import {HeaderBrickComponent} from './component/header-brick.component';
import {BrickRegistry} from '../../wall/registry/brick-registry.service';
import {ContenteditableModule} from '../../modules/contenteditable/contenteditable.module';

@NgModule({
    imports: [
        FormsModule,
        CommonModule,
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
            textRepresentation: TextRepresentation,
            name: 'Header',
            description: 'A large header with margins'
        });
    }
}
