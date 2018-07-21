import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ContenteditableModule} from '../../modules/contenteditable';
import {BrickRegistry} from '../../wall';
import {TextRepresentation} from '../base-text-brick/base-text-representation.class';
import {HeaderBrickComponent} from './component/header-brick.component';

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
