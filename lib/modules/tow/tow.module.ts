import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RadarModule } from '../radar';
import { BeaconDetector } from './beacon-detector/beacon-detector.service';
import { BeaconRegistry } from './beacon/beacon.registry.service';
import { PlaceholderComponent } from './placeholder-renderer/component/placeholder.component';
import { PlaceholderRenderer } from './placeholder-renderer/placeholder-renderer.service';
import { TowCoordinator } from './tow-coordinator.service';
import { TowSlaveDirective } from './tow-slave/tow-slave.directive';
import { TowService } from './tow.service';

@NgModule({
    imports: [
        CommonModule,
        RadarModule
    ],

    declarations: [
        TowSlaveDirective,
        PlaceholderComponent
    ],

    entryComponents: [
        PlaceholderComponent
    ],

    exports: [
        TowSlaveDirective
    ],

    providers: [
        TowService,
        BeaconDetector,
        BeaconRegistry,
        TowCoordinator,
        PlaceholderRenderer
    ]
})
export class TowModule {
}
