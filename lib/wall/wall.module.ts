import { NgModule } from '@angular/core';
import { WallComponent } from './components/wall/wall.component';
import { BrickRegistry } from './registry/brick-registry.service';
import { CommonModule } from '@angular/common';

@NgModule({
    providers: [
        CommonModule,
        BrickRegistry
    ],
    declarations: [
        WallComponent
    ],
    exports: [
        WallComponent
    ]
})
export class WallModule {
}
