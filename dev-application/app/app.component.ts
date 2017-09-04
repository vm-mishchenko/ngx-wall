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
        "bricks": [
            {
                "id": "1",
                "tag": "header",
                "data": {
                    "text": "Text brick"
                },
                "meta": {
                    "comments": []
                }
            },
            {
                "id": "2",
                "tag": "text",
                "data": {
                    "text": "Second text block"
                },
                "meta": {}
            },
            {
                "id": "63c7741c-f95d-eb6c-8126-5cec5d55c6be",
                "tag": "img",
                "data": {},
                "meta": {}
            },
            {
                "id": "879f3d37-a4a6-1d67-cb56-2900bae5d8ff",
                "tag": "text",
                "data": {},
                "meta": {}
            },
            {
                "id": "27f357aa-f6e6-154e-c5de-8a95c04cdc49",
                "tag": "header",
                "data": {
                    "text": "Image brick"
                },
                "meta": {}
            }
        ],
        "layout": {
            "bricks": [
                {
                    "columns": [
                        {
                            "bricks": [
                                {
                                    "id": "1"
                                }
                            ]
                        }
                    ]
                },
                {
                    "columns": [
                        {
                            "bricks": [
                                {
                                    "id": "2"
                                },
                                {
                                    "id": "27f357aa-f6e6-154e-c5de-8a95c04cdc49"
                                }
                            ]
                        }
                    ]
                },
                {
                    "columns": [
                        {
                            "bricks": [
                                {
                                    "id": "63c7741c-f95d-eb6c-8126-5cec5d55c6be"
                                }
                            ]
                        }
                    ]
                },
                {
                    "columns": [
                        {
                            "bricks": [
                                {
                                    "id": "879f3d37-a4a6-1d67-cb56-2900bae5d8ff"
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

    onNewRowIndexOne() {
        this.wallApi.core.addBrickToNewRow('text', 1);
    }

    onNewColumnIndexOneInRowZero() {
        this.wallApi.core.addBrickToNewColumn('text', 0, 23);
    }
}