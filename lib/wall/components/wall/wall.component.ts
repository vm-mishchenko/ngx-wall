import { Component, Injector, Input, OnChanges, OnDestroy, ReflectiveInjector, SimpleChanges } from '@angular/core';
import { WallConfiguration } from './wall.interfaces';
import { WallApi } from './wall-api.service';
import { IWallModel } from '../../wall.interfaces';
import { WallViewModel } from './wall-view.model';
import { WALL_PLUGIN } from '../../wall.tokens';

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
    @Input() configuration: WallConfiguration = null;
    private initializedPlugins: any[] = [];

    constructor(private injector: Injector,
                public api: WallApi,
                private wallViewModel: WallViewModel) {
    }

    onCanvasClick() {
        this.model.addDefaultBrick();
    }

    // callback when user focused to some brick by mouse click
    onFocusedBrick(brickId: string) {
        this.wallViewModel.onFocusedBrick(brickId);
    }

    onBrickStateChanged(event) {
        this.model.updateBrickState(event.brickId, event.brickState);
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
            if (plugin.destroy) {
                plugin.destroy();
            }
        });

        this.initializedPlugins = [];
    }
}
