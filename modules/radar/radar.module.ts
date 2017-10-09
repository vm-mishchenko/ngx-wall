import { NgModule } from '@angular/core';
import { Radar } from "./radar.service";
import { SpotDirective } from "./directive/radar.directive";
import { WindowReference } from "./radar.tokens";
import { RadarCoordinator } from "./radar-coordinator.service";

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