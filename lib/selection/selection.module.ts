import { NgModule } from '@angular/core';
import { SelectionRegister } from './selection-register.service';
import { SelectionDirective } from './selection.directive';
import { SelectionAreaDirective } from './selection-area.directive';
import { SelectionRange } from './selection-range.component';

@NgModule({
    declarations: [
        SelectionRange,
        SelectionDirective,
        SelectionAreaDirective
    ],

    providers: [
        SelectionRegister
    ],

    exports: [
        SelectionDirective,
        SelectionAreaDirective
    ],

    entryComponents: [
        SelectionRange
    ]
})
export class SelectionModule {

}