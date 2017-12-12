import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BeaconDetector } from './beacon-detector/beacon-detector.service';
import { BeaconDirective } from './beacon/beacon.directive';
import { BeaconRegistry } from './beacon/beacon.registry.service';
import { PlaceholderComponent } from './placeholder-renderer/component/placeholder.component';
import { PlaceholderRenderer } from './placeholder-renderer/placeholder-renderer.service';
import { TowCoordinator } from './tow-coordinator.service';
import { TowSlaveDirective } from './tow-slave/tow-slave.directive';
import { TowService } from './tow.service';
import { WindowReference } from './tow.tokens';

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
        TowService,
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
