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
                'id': 'd5075777-eb67-2dce-f634-a82b3221234b',
                'tag': 'header',
                'meta': {},
                'data': {
                    'text': 'Code brick'
                }
            },
            {
                'id': 'a430f77e-6543-2145-2f00-6d66dbe7e241',
                'tag': 'text',
                'meta': {},
                'data': {
                    'text': ''
                }
            },
            {
                'id': '5a47f1be-06de-f67a-0684-2a339a275c2d',
                'tag': 'text',
                'meta': {},
                'data': {
                    'text': ''
                }
            },
            {
                'id': '15a54c99-ff37-3a71-9bb8-7bb5e7200b9c',
                'tag': 'code',
                'meta': {},
                'data': {
                    'code': 'sudo apt-get install foo;',
                    'mode': 'shell'
                }
            },
            {
                'id': '9c2c4de3-4e5f-718b-61ec-c5c3035efb54',
                'tag': 'text',
                'meta': {},
                'data': {}
            },
            {
                'id': '65b02545-8b50-1e09-be1f-6fdb412d4b9e',
                'tag': 'text',
                'meta': {},
                'data': {
                    'text': ''
                }
            },
            {
                'id': 'fe95d802-05d6-f804-3f0d-076b7c8d4997',
                'tag': 'code',
                'meta': {},
                'data': {
                    'code': 'asd\nfdgdfg\nsdfsdf',
                    'mode': 'javascript'
                }
            },
            {
                'id': '76c967f1-ad93-8e57-9d2c-3248c747f646',
                'tag': 'text',
                'meta': {},
                'data': {}
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
                                    'id': 'd5075777-eb67-2dce-f634-a82b3221234b'
                                }
                            ]
                        }
                    ],
                    'id': 'ae73dbcf-4792-4818-dbb0-ccef60ad3002'
                },
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': 'a430f77e-6543-2145-2f00-6d66dbe7e241'
                                }
                            ]
                        }
                    ],
                    'id': '66f6504a-ec01-8339-fc3a-edbad457a162'
                },
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': '5a47f1be-06de-f67a-0684-2a339a275c2d'
                                }
                            ]
                        }
                    ],
                    'id': 'bdd39d67-d507-5ebc-fc05-8716c3ee9e38'
                },
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': '15a54c99-ff37-3a71-9bb8-7bb5e7200b9c'
                                }
                            ]
                        }
                    ],
                    'id': 'cb38d385-ffb2-a799-3eea-2374c444af30'
                },
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': '9c2c4de3-4e5f-718b-61ec-c5c3035efb54'
                                }
                            ]
                        }
                    ],
                    'id': '1fef4c54-3764-feba-3282-df74e853b01a'
                },
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': '65b02545-8b50-1e09-be1f-6fdb412d4b9e'
                                }
                            ]
                        }
                    ],
                    'id': '16b0f6db-2cc5-6abf-44d1-ab9217e2b09f'
                },
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': 'fe95d802-05d6-f804-3f0d-076b7c8d4997'
                                }
                            ]
                        }
                    ],
                    'id': '90bacdba-abaa-f881-99a6-4669b10f811b'
                },
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': '76c967f1-ad93-8e57-9d2c-3248c747f646'
                                }
                            ]
                        }
                    ],
                    'id': '8b47aa2a-100f-aa33-673c-648c6c90887b'
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
