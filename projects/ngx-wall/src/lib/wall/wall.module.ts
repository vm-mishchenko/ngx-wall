import {CommonModule} from '@angular/common';
import {ModuleWithProviders, NgModule} from '@angular/core';
import {MatIconModule} from '@angular/material';
import {PlaceholderRendererModule} from '../modules/components/placeholder-renderer/placeholder-renderer.module';
import {PickOutModule} from '../modules/pick-out/pick-out.module';
import {RadarModule} from '../modules/radar/radar.module';
import {TowModule} from '../modules/tow/tow.module';
import {WallCanvasBrickComponent} from './components/wall-canvas/components/wall-canvas-brick/wall-canvas-brick.component';
import {WallCanvasComponent} from './components/wall-canvas/wall-canvas.component';
import {WallComponent} from './components/wall/wall.component';
import {WallModelFactory} from './factory/wall-model.factory';
import {BrickRegistry} from './registry/brick-registry.service';

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
