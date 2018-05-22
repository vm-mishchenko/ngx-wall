import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ModalModule} from '../modules/modal';
import {PickOutModule} from '../modules/pick-out';
import {RadarModule} from '../modules/radar';
import {TowModule} from '../modules/tow';
import {PlaceholderComponent} from './components/placeholder-renderer/component/placeholder.component';
import {PlaceholderRenderer} from './components/placeholder-renderer/placeholder-renderer.service';
import {WallCanvasBrickComponent, WallCanvasComponent, WallCanvasRowComponent} from './components/wall-canvas';
import {WallComponent} from './components/wall/wall.component';
import {WallModelFactory} from './model/wall-model.factory';
import {CopyPluginFactory} from './plugins/copy/copy-plugin.factory';
import {SelectionPluginFactory} from './plugins/selection/selection-plugin.factory';
import {UndoRedoPluginFactory} from './plugins/undo-redo/undo-redo-plugin.factory';
import {BrickRegistry} from './registry/brick-registry.service';
import {WALL_PLUGIN} from './wall.tokens';

@NgModule({
    imports: [
        CommonModule,
        PickOutModule,
        TowModule,
        RadarModule,
        ModalModule
    ],

    providers: [
        BrickRegistry,
        WallModelFactory,
        PlaceholderRenderer,
        {
            provide: WALL_PLUGIN, useClass: SelectionPluginFactory, multi: true
        },
        {
            provide: WALL_PLUGIN, useClass: CopyPluginFactory, multi: true
        },
        {
            provide: WALL_PLUGIN, useClass: UndoRedoPluginFactory, multi: true
        }
    ],

    declarations: [
        WallComponent,
        WallCanvasComponent,
        WallCanvasRowComponent,
        WallCanvasBrickComponent,
        PlaceholderComponent
    ],

    exports: [
        WallComponent
    ],

    entryComponents: [
        PlaceholderComponent
    ]
})
export class WallModule {
}
