import {NgModule} from '@angular/core';
import {SpotDirective} from './directive/spot.directive';
import {RadarCoordinator} from './radar-coordinator.service';
import {Radar} from './radar.service';

@NgModule({
    exports: [SpotDirective],
    declarations: [SpotDirective],
    providers: [
        Radar,
        RadarCoordinator
    ]
})
export class RadarModule {
}
