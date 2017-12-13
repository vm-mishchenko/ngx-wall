import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PickOutAreaComponent } from './pick-out-area/pick-out-area.component';
import { PickOutAreaDirective } from './pick-out-area/pick-out-area.directive';
import { PickOutCoordinator } from './pick-out-coordinator.service';
import { PickOutItemDirective } from './pick-out-item/pick-out-item.directive';
import { PickOutService } from './pick-out.service';
import { windowToken } from './pick-out.tokens';

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
        PickOutCoordinator,
        {
            provide: windowToken,
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
