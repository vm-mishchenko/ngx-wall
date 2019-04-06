import {Component, Injector, OnInit} from '@angular/core';
import {
    BeforeChangeEvent,
    CopyPlugin,
    IWallConfiguration,
    IWallDefinition,
    IWallModel,
    IWallModelConfig,
    SelectionPlugin,
    UndoRedoPlugin,
    WALL,
    WallModelFactory
} from 'ngx-wall';

@Component({
    selector: 'app-wall-editor',
    templateUrl: 'wall-editor.component.html'
})
export class WallEditorComponent implements OnInit {
    plan: IWallDefinition;

    wallConfiguration: IWallConfiguration = {
        mode: WALL.MODES.EDIT
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
                'id': '85e2e2ad-5bcf-2afb-1c8e-d191c0475e5c',
                'tag': 'text',
                'meta': {},
                'data': {
                    'text': ''
                }
            },
            {
                'id': 'be5d9de9-36ac-437c-f8c1-24034a0acac4',
                'tag': 'image',
                'meta': {},
                'data': {
                    'src': 'https://cdn-images-1.medium.com/max/1200/1*_x3qqtKg888_AY-qIM7caA.png',
                    'metadata': null,
                    'width': 202
                }
            },
            {
                'id': '08d9d3bc-ad6e-3d19-836f-a121784dd70c',
                'tag': 'header',
                'meta': {},
                'data': {
                    'text': 'Header'
                }
            },
            {
                'id': '51eb8481-745b-d310-31d9-716cddb8e6be',
                'tag': 'text',
                'meta': {},
                'data': {
                    'text': 'Just simple paragraph.'
                }
            },
            {
                'id': 'b5dbcddd-c3c6-676e-477b-97f201286c4f',
                'tag': 'text',
                'meta': {},
                'data': {
                    'text': ' '
                }
            },
            {
                'id': 'c0c8e17c-5034-f8b0-5fda-776e4cbd1e2e',
                'tag': 'text',
                'meta': {},
                'data': {
                    'text': 'You can drag-and-drop all components'
                }
            },
            {
                'id': 'c4bf36e7-158e-241e-377c-8fcd4efd2af7',
                'tag': 'text',
                'meta': {},
                'data': {
                    'text': 'Add new component typing <b>/</b> on the new line'
                }
            },
            {
                'id': '54f443b1-87c9-782b-c739-c57947facf41',
                'tag': 'text',
                'meta': {},
                'data': {
                    'text': ''
                }
            },
            {
                'id': '797a2e3d-5cc8-e567-d154-8d4971eb8f5a',
                'tag': 'text',
                'meta': {},
                'data': {
                    'text': 'Add visual divider'
                }
            },
            {
                'id': '98cabd9e-7b1a-1480-e292-742fad60cbc7',
                'tag': 'divider',
                'meta': {},
                'data': {}
            },
            {
                'id': '1e946e6a-8ecf-3654-bfe0-26575c2d2495',
                'tag': 'text',
                'meta': {},
                'data': {
                    'text': ''
                }
            },
            {
                'id': '8071b44f-934b-83c5-3e83-1b1ec2015321',
                'tag': 'quote',
                'meta': {},
                'data': {
                    'text': 'Your favorite quote'
                }
            },
            {
                'id': '094f8b19-44d1-60f2-f186-78ff058affb6',
                'tag': 'text',
                'meta': {},
                'data': {
                    'text': ''
                }
            },
            {
                'id': 'a2718a87-4dcd-d0dd-7f8c-f638b106d5c8',
                'tag': 'text',
                'meta': {},
                'data': {
                    'text': ''
                }
            },
            {
                'id': '1ea33a24-b7d7-7ada-b6e1-8d4986784d76',
                'tag': 'code',
                'meta': {},
                'data': {
                    'code': '// code snippet\nfunction foo(){\n\tconsole.log(\'foo\');\n}',
                    'mode': 'javascript'
                }
            },
            {
                'id': '2647e2c1-5988-9734-632b-0af8f5b92df4',
                'tag': 'text',
                'meta': {},
                'data': {}
            },
            {
                'id': '3f38d65c-a446-68ef-a2d0-5aa5217988de',
                'tag': 'text',
                'meta': {},
                'data': {
                    'text': 'Add <a href="https://www.youtube.com/watch?v=Tyd0FO0tko8">link</a> to <b>youtube</b> <i>video</i>'
                }
            },
            {
                'id': 'a49f4702-62f2-77b7-9259-239642cd7177',
                'tag': 'divider',
                'meta': {},
                'data': {}
            },
            {
                'id': '29bcd1d2-99fc-917b-bdbe-62680c3d99e5',
                'tag': 'video',
                'meta': {},
                'data': {
                    'src': 'https://www.youtube.com/embed/Tyd0FO0tko8'
                }
            },
            {
                'id': '328349c4-401e-a52d-7771-b70bc5168f22',
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
                                    'id': '85e2e2ad-5bcf-2afb-1c8e-d191c0475e5c'
                                }
                            ]
                        }
                    ],
                    'id': '629144f9-b587-7185-a929-8f9261ee2b32'
                },
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': 'be5d9de9-36ac-437c-f8c1-24034a0acac4'
                                }
                            ]
                        }
                    ],
                    'id': '236649ab-5fcc-7e14-25dd-be5adbf0a394'
                },
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': '08d9d3bc-ad6e-3d19-836f-a121784dd70c'
                                }
                            ]
                        }
                    ],
                    'id': '217276e6-13ad-7106-a6f9-2c20f3852b2f'
                },
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': '51eb8481-745b-d310-31d9-716cddb8e6be'
                                }
                            ]
                        }
                    ],
                    'id': 'c63e63f7-4215-485e-4b76-9c8c219415f4'
                },
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': 'b5dbcddd-c3c6-676e-477b-97f201286c4f'
                                }
                            ]
                        }
                    ],
                    'id': '5a5b9682-f272-9f4d-9d47-ce2bb42f0dc5'
                },
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': 'c0c8e17c-5034-f8b0-5fda-776e4cbd1e2e'
                                }
                            ]
                        },
                        {
                            'bricks': [
                                {
                                    'id': 'c4bf36e7-158e-241e-377c-8fcd4efd2af7'
                                }
                            ]
                        }
                    ],
                    'id': '23f66f8f-a253-933e-690d-fc761faec4ec'
                },
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': '54f443b1-87c9-782b-c739-c57947facf41'
                                }
                            ]
                        }
                    ],
                    'id': '2768781d-2481-2ff1-6902-1ac14ebec533'
                },
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': '797a2e3d-5cc8-e567-d154-8d4971eb8f5a'
                                }
                            ]
                        }
                    ],
                    'id': '0ca3f5a7-5ad7-6b07-7e31-93d815358b4f'
                },
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': '98cabd9e-7b1a-1480-e292-742fad60cbc7'
                                }
                            ]
                        }
                    ],
                    'id': 'c780f69b-00bd-fa7d-f73f-57af83cc8797'
                },
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': '1e946e6a-8ecf-3654-bfe0-26575c2d2495'
                                }
                            ]
                        }
                    ],
                    'id': '87efaae8-71fc-306c-54b5-8ee308ec3461'
                },
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': '8071b44f-934b-83c5-3e83-1b1ec2015321'
                                }
                            ]
                        }
                    ],
                    'id': 'a39c42f9-225a-1995-8a74-fbfcab9f33fc'
                },
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': '094f8b19-44d1-60f2-f186-78ff058affb6'
                                }
                            ]
                        },
                        {
                            'bricks': [
                                {
                                    'id': 'a2718a87-4dcd-d0dd-7f8c-f638b106d5c8'
                                }
                            ]
                        }
                    ],
                    'id': '1e05b4d2-6003-6d84-3cb8-c8fc7d83d3b9'
                },
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': '1ea33a24-b7d7-7ada-b6e1-8d4986784d76'
                                }
                            ]
                        }
                    ],
                    'id': '90738194-749c-f501-ed47-4b08f26803f2'
                },
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': '2647e2c1-5988-9734-632b-0af8f5b92df4'
                                }
                            ]
                        }
                    ],
                    'id': '5cb67f1c-83ee-9ffa-a284-4454fcb79250'
                },
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': '3f38d65c-a446-68ef-a2d0-5aa5217988de'
                                }
                            ]
                        }
                    ],
                    'id': 'b8cb795a-0d6e-a5df-ab83-9b98204b2a55'
                },
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': 'a49f4702-62f2-77b7-9259-239642cd7177'
                                }
                            ]
                        }
                    ],
                    'id': '1258522b-ca26-c3c9-f729-c134f8c7d0ce'
                },
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': '29bcd1d2-99fc-917b-bdbe-62680c3d99e5'
                                }
                            ]
                        }
                    ],
                    'id': '4b2bdd17-2678-3e0e-4cdb-28f66114796e'
                },
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': '328349c4-401e-a52d-7771-b70bc5168f22'
                                }
                            ]
                        }
                    ],
                    'id': '6e4378e9-9f78-7e9c-2696-c6f4ac8a4be2'
                }
            ]
        }
    };

    wallModel: IWallModel;

    constructor(private wallModelFactory: WallModelFactory,
                private injector: Injector) {
        const modelConfig: IWallModelConfig = {
            plan: this.wallPlan,
            plugins: [
                new CopyPlugin(this.injector),
                new UndoRedoPlugin(this.injector),
                new SelectionPlugin(this.injector)
            ]
        };

        this.wallModel = this.wallModelFactory.create(modelConfig);
    }

    ngOnInit() {
        setTimeout(() => {
            this.wallModel.api.core.subscribe((e) => {
                if (!(e instanceof BeforeChangeEvent)) {
                    // update current plan
                    this.plan = this.wallModel.api.core.getPlan();
                }
            });
        }, 10);
    }
}
