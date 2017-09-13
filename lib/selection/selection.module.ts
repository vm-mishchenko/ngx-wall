import { NgModule } from '@angular/core';
import { SelectionRegister } from './selection-register.service';
import { SelectionAreaDirective } from './selection-area.directive';
import { SelectionRange } from './selection-range.component';
import { CommonModule } from '@angular/common';
import { SelectionItemDirective } from './selection-item.directive';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        SelectionRange,
        SelectionItemDirective,
        SelectionAreaDirective
    ],

    providers: [
        SelectionRegister
    ],

    exports: [
        SelectionItemDirective,
        SelectionAreaDirective
    ],

    entryComponents: [
        SelectionRange
    ]
})
export class SelectionModule {

}