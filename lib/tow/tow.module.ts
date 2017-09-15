import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaceholderRenderer } from './placeholder-renderer/placeholder-renderer.service';
import { PlaceholderComponent } from './placeholder-renderer/component/placeholder.component';
import { BeaconRegistry } from './beacon/beacon.registry.service';
import { WindowReference } from './tow.tokens';
import { BeaconDirective } from './beacon/beacon.directive';
import { BeaconDetector } from './beacon-detector/beacon-detector.service';
import { TowCoordinator } from './tow-coordinator.service';
import { TowSlaveDirective } from './tow-slave/tow-slave.directive';

@NgModule({
    imports: [
        CommonModule
    ],

    declarations: [
        BeaconDirective,
        TowSlaveDirective,
        PlaceholderComponent
    ],

    entryComponents: [
        PlaceholderComponent
    ],

    exports: [
        BeaconDirective,
        TowSlaveDirective
    ],

    providers: [
        BeaconDetector,
        BeaconRegistry,
        TowCoordinator,
        PlaceholderRenderer,
        {
            provide: WindowReference,
            useValue: window
        }
    ]
})
export class TowModule {
}
