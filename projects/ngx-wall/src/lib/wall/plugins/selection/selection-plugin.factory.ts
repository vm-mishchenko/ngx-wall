import {Injectable, Injector} from '@angular/core';
import {WallApi} from '../../components/wall';
import {IWallPluginFactory} from '../../wall.interfaces';
import {SelectionPlugin} from './selection';

@Injectable()
export class SelectionPluginFactory implements IWallPluginFactory {
    constructor(private injector: Injector) {
    }

    instantiate(wallApi: WallApi) {
        return new SelectionPlugin(wallApi, this.injector);
    }
}
