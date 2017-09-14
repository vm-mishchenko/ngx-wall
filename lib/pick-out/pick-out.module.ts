import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PickOutItemDirective } from './pick-out-item/pick-out-item.directive';
import { PickOutAreaDirective } from './pick-out-area/pick-out-area.directive';
import { PickOutNotifier } from './pick-out-notifier.service';
import { PickOutHandlerService } from './pick-out-handler.service';
import { PickOutAreaComponent } from './pick-out-area/pick-out-area.component';

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
        PickOutNotifier,
        PickOutHandlerService
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