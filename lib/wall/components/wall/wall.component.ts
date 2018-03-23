import { Component, Injector, Input, OnChanges, OnDestroy, ReflectiveInjector, SimpleChanges } from '@angular/core';
import { IWallModel } from '../../model/model.interfaces';
import { WALL_PLUGIN } from '../../wall.tokens';
import { WallApi } from './wall-api.service';
import { WallViewModel } from './wall-view.model';
import { IWallConfiguration } from './wall.interfaces';

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

    private initializedPlugins: any[] = [];

    constructor(private injector: Injector,
                public api: WallApi,
                private wallViewModel: WallViewModel) {
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
        const plugins = this.injector.get(WALL_PLUGIN);
        const pluginInjector = ReflectiveInjector.resolveAndCreate(plugins, this.injector);

        plugins.forEach((plugin) => {
            this.initializedPlugins.push(pluginInjector.resolveAndInstantiate(plugin));
        });
    }

    private destroyPlugins() {
        this.initializedPlugins.forEach((plugin) => {
            if (plugin.onPluginDestroy) {
                plugin.onPluginDestroy();
            }
        });

        this.initializedPlugins = [];
    }
}
