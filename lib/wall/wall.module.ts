import { NgModule } from '@angular/core';
import { WallComponent } from './components/wall/wall.component';
import { BrickRegistry } from './registry/brick-registry.service';
import { CommonModule } from '@angular/common';
import { WallCanvasComponent } from './components/wall-canvas/wall-canvas.component';
import { WallCanvasRowComponent } from './components/wall-canvas/components/wall-canvas-row/wall-canvas-row.component';
import { BrowserModule } from '@angular/platform-browser';
import { WallCanvasBrickComponent } from './components/wall-canvas/components/wall-canvas-brick/wall-canvas-brick.component';

@NgModule({
    imports: [
        BrowserModule
    ],
    providers: [

        CommonModule,
        BrickRegistry
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
