import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {PlaceholderRendererModule} from '../modules/components/placeholder-renderer';
import {ModalModule} from '../modules/modal';
import {PickOutModule} from '../modules/pick-out';
import {RadarModule} from '../modules/radar';
import {TowModule} from '../modules/tow';
import {WallCanvasBrickComponent, WallCanvasComponent, WallCanvasRowComponent} from './components/wall-canvas';
import {WallComponent} from './components/wall/wall.component';
import {WallModelFactory} from './model/wall-model.factory';
import {BrickRegistry} from './registry/brick-registry.service';

@NgModule({
    imports: [
        CommonModule,
        PickOutModule,
        TowModule,
        RadarModule,
        ModalModule,
        PlaceholderRendererModule
    ],

    providers: [
        BrickRegistry,
        WallModelFactory
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
