import { ChangeDetectorRef, Component, Injectable } from '@angular/core';
import { IWallApi, IWallDefinition, WALL_PLUGIN, WallApi } from 'wall';

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
    `],

    providers: [
    ]
})
export class AppComponent {
    plan: any = null;

    wallApi: IWallApi = null;

    wallConfiguration = {
        mode: 'readonly',

        onRegisterApi: this.onRegisterApi.bind(this)
    };

    wallPlan: IWallDefinition = {
        'bricks': [
            {
                'id': '1',
                'tag': 'header',
                'data': {
                    'text': 'Text brick'
                },
                'meta': {
                    'comments': []
                }
            },
            {
                'id': '2',
                'tag': 'text',
                'data': {
                    'text': 'Second text block'
                },
                'meta': {}
            },
            {
                'id': '3',
                'tag': 'img',
                'data': {},
                'meta': {}
            },
            {
                'id': '4',
                'tag': 'text',
                'data': {},
                'meta': {}
            },
            {
                'id': '5',
                'tag': 'header',
                'data': {
                    'text': 'Image brick'
                },
                'meta': {}
            }
        ],
        'layout': {
            'bricks': [
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': '1'
                                }
                            ]
                        }
                    ]
                },
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': '2'
                                },
                                {
                                    'id': '3'
                                }
                            ]
                        }
                    ]
                },
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': '4'
                                }
                            ]
                        }
                    ]
                },
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': '5'
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