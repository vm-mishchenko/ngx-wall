import {CommonModule} from '@angular/common';
import {ModuleWithProviders, NgModule} from '@angular/core';
import {PlaceholderRendererModule} from '../modules/components/placeholder-renderer';
import {PickOutModule} from '../modules/pick-out';
import {RadarModule} from '../modules/radar';
import {TowModule} from '../modules/tow';
import {WallCanvasBrickComponent, WallCanvasComponent, WallCanvasRowComponent} from './components/wall-canvas';
import {WallComponent} from './components/wall/wall.component';
import {WallModelFactory} from './factory/wall-model.factory';
import {BrickRegistry} from './registry/brick-registry.service';
import {MatIconModule} from '@angular/material';

@NgModule({
    imports: [
        CommonModule,
        PickOutModule,
        TowModule,
        RadarModule,
        PlaceholderRendererModule,
        MatIconModule
    ],

    declarations: [
        WallComponent,
        WallCanvasComponent,
        WallCanvasRowComponent,
        WallCanvasBrickComponent
    ],

    exports: [
        WallComponent
    ]
})
export class WallModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: WallModule,
            providers: [
                BrickRegistry,
                WallModelFactory
            ]
        };
    }
}
