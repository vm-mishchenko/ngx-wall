import { Component } from '@angular/core';
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
    wallConfiguration = {
        mode: 'readonly',

        onRegisterApi(wallApi: any) {
            // subscribe to all core events
            wallApi.core.subscribe((event: any) => {
                console.log(event);
            });


            // use logger feature provided by Logger plugin
            wallApi.features.logger.log('Use Logger plugin');
        },

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
            }
        ]
    };

    wallPlan: IWallDefinition = {
        bricks: [
            {
                id: '1',
                type: 'text',
                data: {
                    text: 'boo'
                },
                meta: {
                    comments: []
                }
            },
            {
                id: '2',
                type: 'text',
                data: {
                    text: 'foo'
                },
                meta: {}
            },
            {
                id: '3',
                type: 'text',
                data: {
                    text: 'foo 2'
                },
                meta: {}
            }
        ],

        layout: {
            bricks: [
                {
                    type: 'brick',
                    id: '1'
                },
                {
                    type: 'group',
                    columns: [
                        {
                            bricks: [
                                {
                                    id: '2',
                                    type: 'brick'
                                },
                                {
                                    id: '3',
                                    type: 'brick'
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    };

    constructor() {
    }
}