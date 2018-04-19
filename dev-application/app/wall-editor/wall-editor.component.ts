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
                'id': 'a9c91b70-01b0-8be0-4bd5-6a8a8379fd51',
                'tag': 'text',
                'meta': {},
                'data': {}
            },
            {
                'id': '8551daa0-68ec-663c-48d5-fddcb01897e2',
                'tag': 'text',
                'meta': {},
                'data': {
                    'text': 'first <b>bold</b>'
                }
            },
            {
                'id': 'd6404e69-b2ca-f7ee-0da6-8872d958b7b1',
                'tag': 'text',
                'meta': {},
                'data': {
                    'text': '<b>second</b>'
                }
            },
            {
                'id': 'f16450b4-408e-d4a7-fdfe-759bbf7a9670',
                'tag': 'text',
                'meta': {},
                'data': {}
            },
            {
                'id': 'd3fd5c9d-462b-4b93-724c-45cd649012ee',
                'tag': 'text',
                'meta': {},
                'data': {
                    'text': 'o<b>n</b>e'
                }
            },
            {
                'id': 'dd63bffb-64d2-2f67-a476-95cfd2f538fd',
                'tag': 'text',
                'meta': {},
                'data': {
                    'text': 'two'
                }
            },
            {
                'id': '4159404b-3956-5d17-248c-8928262ae450',
                'tag': 'text',
                'meta': {},
                'data': {
                    'text': ''
                }
            },
            {
                'id': '5358e582-eee3-a5db-8189-fe8f3892ba69',
                'tag': 'text',
                'meta': {},
                'data': {
                    'text': 'one'
                }
            },
            {
                'id': '24790195-d5fb-6c6a-ee58-579347ed73f8',
                'tag': 'text',
                'meta': {},
                'data': {
                    'text': 'two'
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
                                    'id': 'a9c91b70-01b0-8be0-4bd5-6a8a8379fd51'
                                }
                            ]
                        }
                    ],
                    'id': 'f30e6ee1-4dfd-8edc-927d-34b70945a377'
                },
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': '8551daa0-68ec-663c-48d5-fddcb01897e2'
                                }
                            ]
                        }
                    ],
                    'id': '4a190e37-c08e-2be8-a75f-f29a2bcabac2'
                },
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': 'd6404e69-b2ca-f7ee-0da6-8872d958b7b1'
                                }
                            ]
                        }
                    ],
                    'id': 'd535fe72-879d-a675-41b8-91e18f62531a'
                },
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': 'f16450b4-408e-d4a7-fdfe-759bbf7a9670'
                                }
                            ]
                        }
                    ],
                    'id': '7f1b0988-7302-90d3-98f3-10f8860adb3f'
                },
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': 'd3fd5c9d-462b-4b93-724c-45cd649012ee'
                                }
                            ]
                        }
                    ],
                    'id': '32b8a826-c77d-f298-402d-fbea9a973a09'
                },
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': 'dd63bffb-64d2-2f67-a476-95cfd2f538fd'
                                }
                            ]
                        }
                    ],
                    'id': '0685944d-a7cb-0d03-dfc9-9d400a3c9a94'
                },
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': '4159404b-3956-5d17-248c-8928262ae450'
                                }
                            ]
                        }
                    ],
                    'id': '2e6e1221-bdcb-714c-1a37-14395971c6bd'
                },
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': '5358e582-eee3-a5db-8189-fe8f3892ba69'
                                }
                            ]
                        }
                    ],
                    'id': '48a35035-321f-b610-9f64-3c732688b92b'
                },
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': '24790195-d5fb-6c6a-ee58-579347ed73f8'
                                }
                            ]
                        }
                    ],
                    'id': '098137e1-a621-46e2-897c-c0002a3f67d8'
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
