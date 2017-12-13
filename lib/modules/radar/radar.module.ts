import { NgModule } from '@angular/core';
import { SpotDirective } from './directive/radar.directive';
import { RadarCoordinator } from './radar-coordinator.service';
import { Radar } from './radar.service';
import { windowToken } from './radar.tokens';

@NgModule({
    exports: [SpotDirective],
    declarations: [SpotDirective],
    providers: [
        Radar,
        RadarCoordinator,
        {
            provide: windowToken,
            useValue: window
        }
    ]
})
export class RadarModule {
}
