import { Component } from '@angular/core';
import { IWallDefinition, WallApi } from 'wall';

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

        onRegisterApi(wallApi: WallApi) {
            wallApi.core.events.subscribe((event: any) => {
                console.log(event);
            });

            wallApi.features.logger.log('Use Logger plugin');
        },

        plugins: [
            {
                initialize: function (wallApi: WallApi) {

                    // extend existing API
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