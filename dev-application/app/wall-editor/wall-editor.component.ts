import { Component, OnInit } from '@angular/core';
import { IWallConfiguration, IWallDefinition, WALL, WallApi, WallModelFactory } from 'ngx-wall';

@Component({
    selector: 'wall-editor',
    templateUrl: 'wall-editor.component.html',
    styles: [`
        .wrapper {
            width: 800px;
            margin: 0 auto;
        }
    `]
})
export class WallEditorComponent implements OnInit {
    plan: any = null;

    wallApi: WallApi = null;

    wallConfiguration: IWallConfiguration = {
        mode: WALL.MODES.EDIT,

        onRegisterApi: this.onRegisterApi.bind(this)
    };

    wallPlan: IWallDefinition = {
        'bricks': [
            {
                'id': 'f6cdbdab-029a-50ee-d6de-5f8b2b2667df',
                'tag': 'text',
                'meta': {},
                'data': {}
            },
            {
                'id': 'aa3f57ed-b176-257f-9668-42880fb299b0',
                'tag': 'text',
                'meta': {},
                'data': {
                    'text': ''
                }
            },
            {
                'id': '70a48cf9-0d51-567b-5c4a-9f72e429176a',
                'tag': 'text',
                'meta': {},
                'data': {
                    'text': ''
                }
            },
            {
                'id': '6156d55d-1b63-0e7e-feea-6d41728274e5',
                'tag': 'image',
                'meta': {},
                'data': {
                    'src': 'https://cdn.pixabay.com/photo/2017/08/15/08/23/galaxy-2643089_960_720.jpg'
                }
            }
        ],
        'layout': {
            'bricks': [
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': 'f6cdbdab-029a-50ee-d6de-5f8b2b2667df'
                                }
                            ]
                        }
                    ],
                    'id': '2db30bf7-378a-2b48-113e-c3467484598f'
                },
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': 'aa3f57ed-b176-257f-9668-42880fb299b0'
                                }
                            ]
                        }
                    ],
                    'id': 'b76e08a0-469d-8393-6057-e95726ffab37'
                },
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': '70a48cf9-0d51-567b-5c4a-9f72e429176a'
                                }
                            ]
                        }
                    ],
                    'id': 'a6835ed8-70e9-f16e-9b02-b8550da7da11'
                },
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': '6156d55d-1b63-0e7e-feea-6d41728274e5'
                                }
                            ]
                        }
                    ],
                    'id': '58236ec0-b7d5-ac10-36cb-bd8fef00a899'
                }
            ]
        }
    };

    wall2Model: any;

    constructor(private wallModelFactory: WallModelFactory) {
        this.wall2Model = this.wallModelFactory.create(this.wallPlan);
    }

    ngOnInit() {
    }

    onRegisterApi(wallApi: WallApi) {
        this.wallApi = wallApi;

        this.plan = wallApi.core.getPlan();

        // subscribe to all core events
        wallApi.core.subscribe((event: any) => {
            // update current plan
            this.plan = wallApi.core.getPlan();
        });
    }
}
