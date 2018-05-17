import {Injectable, Injector} from '@angular/core';
import {WallApi} from '../../components/wall';
import {IWallPluginFactory} from '../../wall.interfaces';
import {UndoRedoPlugin} from './undo-redo.plugin';

@Injectable()
export class UndoRedoPluginFactory implements IWallPluginFactory {
    constructor(private injector: Injector) {
    }

    instantiate(wallApi: WallApi) {
        return new UndoRedoPlugin(wallApi, this.injector);
    }
}