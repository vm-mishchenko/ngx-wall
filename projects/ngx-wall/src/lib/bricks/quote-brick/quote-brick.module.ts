import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ContenteditableModule} from '../../modules/contenteditable/contenteditable.module';
import {BrickRegistry} from '../../wall/wall';
import {TextRepresentation} from '../base-text-brick/base-text-representation.class';
import {QuoteBrickComponent} from './component/quote-brick.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ContenteditableModule
    ],
    exports: [QuoteBrickComponent],
    declarations: [QuoteBrickComponent],
    entryComponents: [QuoteBrickComponent]
})
export class QuoteBrickModule {
    constructor(private brickRegistry: BrickRegistry) {
        this.brickRegistry.register({
            tag: 'quote',
            component: QuoteBrickComponent,
            supportText: true,
            textRepresentation: TextRepresentation,
            name: 'Quote',
            description: 'Capture a quote'
        });
    }
}
