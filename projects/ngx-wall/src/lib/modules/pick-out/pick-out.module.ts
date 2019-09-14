import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RadarModule} from '../radar/radar.module';
import {PickOutAreaComponent} from './pick-out-area/pick-out-area.component';
import {PickOutAreaDirective} from './pick-out-area/pick-out-area.directive';
import {PickOutService} from './pick-out.service';

@NgModule({
    imports: [
        CommonModule,
        RadarModule
    ],

    declarations: [
        PickOutAreaComponent,
        PickOutAreaDirective
    ],

    providers: [
        PickOutService,
    ],

    exports: [
        PickOutAreaDirective
    ],

    entryComponents: [
        PickOutAreaComponent
    ]
})

export class PickOutModule {
}
