import {Injectable, Injector} from '@angular/core';
import {WallApi} from '../../components/wall';
import {IWallPluginFactory} from '../../wall.interfaces';
import {CopyPlugin} from './copy.plugin';

@Injectable()
export class CopyPluginFactory implements IWallPluginFactory {
    constructor(private injector: Injector) {
    }

    instantiate(wallApi: WallApi) {
        return new CopyPlugin(wallApi, this.injector);
    }
}
