import { NgModule } from '@angular/core';
import { WallComponent } from './components/wall/wall.component';
import { BrickRegistry } from './registry/brick-registry.service';
import { CommonModule } from '@angular/common';
import { WallCanvasComponent } from './components/wall-canvas/wall-canvas.component';

@NgModule({
    providers: [
        CommonModule,
        BrickRegistry
    ],
    declarations: [
        WallComponent,
        WallCanvasComponent
    ],
    exports: [
        WallComponent
    ]
})
export class WallModule {
}
