import {Component, Injector, Input, OnChanges, OnDestroy, SimpleChanges} from '@angular/core';
import {IWallModel} from '../../model/model.interfaces';
import {IWallPlugin, IWallPluginFactory} from '../../wall.interfaces';
import {WALL_PLUGIN} from '../../wall.tokens';
import {WallApi} from './wall-api.service';
import {WallViewModel} from './wall-view.model';
import {IWallConfiguration} from './wall.interfaces';

@Component({
    selector: 'wall',
    templateUrl: './wall.component.html',
    providers: [
        WallApi,
        WallViewModel
    ]
})
export class WallComponent implements OnChanges, OnDestroy {
    @Input() model: IWallModel = null;
    @Input() configuration: IWallConfiguration = null;

    private initializedPlugins: IWallPlugin[] = [];

    constructor(private injector: Injector,
                public api: WallApi,
                public wallViewModel: WallViewModel) {
    }

    // click on empty space
    onCanvasClick() {
        this.wallViewModel.onCanvasClick();
    }

    // callback when user focused to some brick by mouse click
    onFocusedBrick(brickId: string) {
        this.wallViewModel.onFocusedBrick(brickId);
    }

    onBrickStateChanged(event) {
        this.wallViewModel.onBrickStateChanged(event.brickId, event.brickState);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.model) {
            if (!changes.model.firstChange) {
                this.cleanUp();
            }

            this.initialize();
        }
    }

    ngOnDestroy() {
        this.cleanUp();
    }

    private initialize() {
        // initialize view model by business model
        this.wallViewModel.initialize(this.model);

        this.initializePlugins();

        // pass initialized API back to the client
        if (this.configuration && this.configuration.onRegisterApi) {
            this.configuration.onRegisterApi(this.api);
        }
    }

    private cleanUp() {
        this.wallViewModel.reset();

        this.destroyPlugins();
    }

    private initializePlugins() {
        // initialize plugins
        const pluginFactories: IWallPluginFactory[] = this.injector.get(WALL_PLUGIN);

        pluginFactories.forEach((pluginFactory) => {
            this.initializedPlugins.push(pluginFactory.instantiate(this.api));
        });
    }

    private destroyPlugins() {
        this.initializedPlugins.forEach((plugin) => {
            if (plugin.onWallPluginDestroy) {
                plugin.onWallPluginDestroy();
            }
        });

        this.initializedPlugins = [];
    }
}
