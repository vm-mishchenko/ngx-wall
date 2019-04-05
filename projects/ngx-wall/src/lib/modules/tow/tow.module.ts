import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {TowCoordinator} from './tow-coordinator.service';
import {TowSlaveDirective} from './tow-slave/tow-slave.directive';
import {TowService} from './tow.service';
import {RadarModule} from '../radar/radar.module';

@NgModule({
    imports: [
        CommonModule,
        RadarModule
    ],

    declarations: [
        TowSlaveDirective
    ],

    exports: [
        TowSlaveDirective
    ],

    providers: [
        TowService,
        TowCoordinator
    ]
})
export class TowModule {
}
