import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PickOutModule } from '../modules/pick-out';
import { RadarModule } from "../modules/radar";
import { TowModule } from '../modules/tow';
import { WallCanvasBrickComponent } from './components/wall-canvas/components/wall-canvas-brick/wall-canvas-brick.component';
import { WallCanvasRowComponent } from './components/wall-canvas/components/wall-canvas-row/wall-canvas-row.component';
import { WallCanvasComponent } from './components/wall-canvas/wall-canvas.component';
import { WallComponent } from './components/wall/wall.component';
import { WallModelFactory } from "./model/wall-model.factory";
import { SelectionPlugin } from './plugins/selection/selection';
import { BrickRegistry } from './registry/brick-registry.service';
import { WALL_PLUGIN } from './wall.tokens';

@NgModule({
    imports: [
        CommonModule,
        PickOutModule,
        TowModule,
        RadarModule
    ],

    providers: [
        BrickRegistry,
        WallModelFactory,
        {
            provide: WALL_PLUGIN, useValue: SelectionPlugin, multi: true
        }
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
}
