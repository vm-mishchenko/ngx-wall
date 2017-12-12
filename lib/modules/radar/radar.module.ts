import { NgModule } from '@angular/core';
import { SpotDirective } from "./directive/radar.directive";
import { RadarCoordinator } from "./radar-coordinator.service";
import { Radar } from "./radar.service";
import { WindowReference } from "./radar.tokens";

@NgModule({
    exports: [SpotDirective],
    declarations: [SpotDirective],
    providers: [
        Radar,
        RadarCoordinator,
        {
            provide: WindowReference,
            useValue: window
        }
    ]
})
export class RadarModule {
}