import { NgModule } from '@angular/core';
import { WallComponent } from './components/wall/wall.component';
import { BrickRegistry } from './registry/brick-registry.service';
import { CommonModule } from '@angular/common';
import { WallCanvasComponent } from './components/wall-canvas/wall-canvas.component';
import { WallCanvasTreeComponent } from './components/wall-canvas-tree/wall-canvas-tree.component';

@NgModule({
    providers: [
        CommonModule,
        BrickRegistry
    ],
    declarations: [
        WallComponent,
        WallCanvasComponent,
        WallCanvasTreeComponent
    ],
    exports: [
        WallComponent
    ]
})
export class WallModule {
}
