import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PickOutItemDirective } from './pick-out-item/pick-out-item.directive';
import { PickOutAreaDirective } from './pick-out-area/pick-out-area.directive';

import { PickOutHandlerService } from './pick-out-handler.service';
import { PickOutAreaComponent } from './pick-out-area/pick-out-area.component';
import { WindowReference } from './pick-out.tokens';
import { PickOutService } from './pick-out.service';

@NgModule({
    imports: [
        CommonModule
    ],

    declarations: [
        PickOutAreaComponent,
        PickOutAreaDirective,
        PickOutItemDirective
    ],

    providers: [
        PickOutService,
        PickOutHandlerService,
        {
            provide: WindowReference,
            useValue: window
        }
    ],

    exports: [
        PickOutAreaDirective,
        PickOutItemDirective
    ],

    entryComponents: [
        PickOutAreaComponent
    ]
})

export class PickOutModule {
}