import { ChangeDetectorRef, Component } from '@angular/core';
import { IWallApi, IWallDefinition } from 'wall';

@Component({
    selector: 'my-app',
    templateUrl: './app.component.html',
    styles: [`
        .wrapper {
            display: flex;
            justify-content: space-around;
        }

        .panel {
            flex: 1;
            padding: 0 20px;
        }
    `]
})
export class AppComponent {
    plan: any = null;

    wallApi: IWallApi = null;

    wallConfiguration = {
        mode: 'readonly',

        onRegisterApi: this.onRegisterApi.bind(this),

        plugins: [
            {
                // example of adding plugins
                initialize: function (wallApi: IWallApi) {

                    // register new API which will be available for other plugins
                    wallApi.registerFeatureApi('logger', {
                        log: function (message: string) {
                            console.log(message);
                        }
                    });
                }
            },
            {
                // example of adding plugins
                initialize: function (wallApi: IWallApi) {
                    // register new API which will be available for other plugins
                    wallApi.core.subscribe((event: any) => {
                        console.log(event);
                    });
                }
            }
        ]
    };

    wallPlan: IWallDefinition = {
        bricks: [
            {
                id: '1',
                tag: 'text',
                data: {
                    text: 'First text block'
                },
                meta: {
                    comments: []
                }
            },
            {
                id: '2',
                tag: 'text',
                data: {
                    text: 'Second text block'
                },
                meta: {}
            }
        ],

        layout: {
            bricks: [
                {
                    columns: [
                        {
                            bricks: [
                                {
                                    id: '1'
                                }
                            ]
                        }
                    ]
                },
                {
                    columns: [
                        {
                            bricks: [
                                {
                                    id: '2'
                                }
                            ]
                        }
                    ]
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
}