import { ChangeDetectorRef, Component } from '@angular/core';
import { IWallApi, IWallDefinition } from 'wall';

@Component({
    selector: 'my-app',
    templateUrl: './app.component.html'
})
export class AppComponent {
    plan: any = null;

    wallApi: IWallApi = null;

    wallConfiguration = {
        mode: 'readonly',

        onRegisterApi: this.onRegisterApi.bind(this)
    };

    wallPlan: IWallDefinition = {
        'bricks': [],
        'layout': {
            'bricks': [
                {
                    'columns': []
                }
            ]
        }
    };

    constructor(private changeDetectorRef: ChangeDetectorRef) {
    }

    onRegisterApi(wallApi: IWallApi) {
        this.wallApi = wallApi;

        // subscribe to all core events
        wallApi.core.subscribe((event: any) => {
            // update current plan
            this.plan = wallApi.core.getPlan();
        });

        // use logger feature provided by Logger plugin
        wallApi.features.logger.log('Use Logger plugin');

        this.plan = wallApi.core.getPlan();

        this.changeDetectorRef.detectChanges();
    }

    onNewRowIndexOne() {
        this.wallApi.core.addBrickToNewRow('text', 1);
    }

    onNewColumnIndexOneInRowZero() {
        this.wallApi.core.addBrickToNewColumn('text', 0, 23);
    }
}