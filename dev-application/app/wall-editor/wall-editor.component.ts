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

    wallPlan: IWallDefinition =  {
        "bricks": [
            {
                "id": "a9c91b70-01b0-8be0-4bd5-6a8a8379fd51",
                "tag": "text",
                "meta": {},
                "data": {}
            },
            {
                "id": "8551daa0-68ec-663c-48d5-fddcb01897e2",
                "tag": "text",
                "meta": {},
                "data": {
                    "text": "first <b>bold</b>"
                }
            },
            {
                "id": "d6404e69-b2ca-f7ee-0da6-8872d958b7b1",
                "tag": "text",
                "meta": {},
                "data": {
                    "text": "<b>second</b>"
                }
            },
            {
                "id": "f16450b4-408e-d4a7-fdfe-759bbf7a9670",
                "tag": "text",
                "meta": {},
                "data": {}
            },
            {
                "id": "03e0c87c-7822-4dea-d87d-f31e552cbaa0",
                "tag": "text",
                "meta": {},
                "data": {
                    "text": "<b>bold</b> and <i>italic</i> text"
                }
            },
            {
                "id": "f9c25db8-095a-fdb0-6b59-a28d3e901221",
                "tag": "text",
                "meta": {},
                "data": {
                    "text": ""
                }
            },
            {
                "id": "9ad55f1b-7326-9244-d4e8-43be772dfa8b",
                "tag": "text",
                "meta": {},
                "data": {
                    "text": "<b>bold</b> connect"
                }
            },
            {
                "id": "af7ac02d-0007-4c2c-4fee-4cbb33c84571",
                "tag": "text",
                "meta": {},
                "data": {
                    "text": "this <i>italic</i> merge"
                }
            },
            {
                "id": "e9872fe2-a408-b9d9-dbdc-254f3a6cfe1f",
                "tag": "text",
                "meta": {},
                "data": {
                    "text": ""
                }
            },
            {
                "id": "d3fd5c9d-462b-4b93-724c-45cd649012ee",
                "tag": "text",
                "meta": {},
                "data": {
                    "text": "o<b>n</b>e"
                }
            },
            {
                "id": "68b9f8eb-69e6-6d39-bc21-0457ab4f7baa",
                "tag": "text",
                "meta": {},
                "data": {
                    "text": "two"
                }
            },
            {
                "id": "4159404b-3956-5d17-248c-8928262ae450",
                "tag": "text",
                "meta": {},
                "data": {
                    "text": ""
                }
            },
            {
                "id": "5358e582-eee3-a5db-8189-fe8f3892ba69",
                "tag": "text",
                "meta": {},
                "data": {
                    "text": "one"
                }
            },
            {
                "id": "e6ca18ee-d0b6-151a-0948-cd607ed70609",
                "tag": "text",
                "meta": {},
                "data": {
                    "text": "two"
                }
            }
        ],
        "layout": {
            "bricks": [
                {
                    "columns": [
                        {
                            "bricks": [
                                {
                                    "id": "a9c91b70-01b0-8be0-4bd5-6a8a8379fd51"
                                }
                            ]
                        }
                    ],
                    "id": "f30e6ee1-4dfd-8edc-927d-34b70945a377"
                },
                {
                    "columns": [
                        {
                            "bricks": [
                                {
                                    "id": "8551daa0-68ec-663c-48d5-fddcb01897e2"
                                }
                            ]
                        }
                    ],
                    "id": "4a190e37-c08e-2be8-a75f-f29a2bcabac2"
                },
                {
                    "columns": [
                        {
                            "bricks": [
                                {
                                    "id": "d6404e69-b2ca-f7ee-0da6-8872d958b7b1"
                                }
                            ]
                        }
                    ],
                    "id": "d535fe72-879d-a675-41b8-91e18f62531a"
                },
                {
                    "columns": [
                        {
                            "bricks": [
                                {
                                    "id": "f16450b4-408e-d4a7-fdfe-759bbf7a9670"
                                }
                            ]
                        }
                    ],
                    "id": "7f1b0988-7302-90d3-98f3-10f8860adb3f"
                },
                {
                    "columns": [
                        {
                            "bricks": [
                                {
                                    "id": "03e0c87c-7822-4dea-d87d-f31e552cbaa0"
                                }
                            ]
                        }
                    ],
                    "id": "167d7b68-2f25-d58f-4520-3c5b73e78bd8"
                },
                {
                    "columns": [
                        {
                            "bricks": [
                                {
                                    "id": "f9c25db8-095a-fdb0-6b59-a28d3e901221"
                                }
                            ]
                        }
                    ],
                    "id": "a506c46c-2875-112f-0433-ed73556ed994"
                },
                {
                    "columns": [
                        {
                            "bricks": [
                                {
                                    "id": "9ad55f1b-7326-9244-d4e8-43be772dfa8b"
                                }
                            ]
                        }
                    ],
                    "id": "83c0eb6c-f9f6-2dbd-d6c1-2da962401023"
                },
                {
                    "columns": [
                        {
                            "bricks": [
                                {
                                    "id": "af7ac02d-0007-4c2c-4fee-4cbb33c84571"
                                }
                            ]
                        }
                    ],
                    "id": "0ac9042b-29f2-b5a8-aee3-2fb38b898c66"
                },
                {
                    "columns": [
                        {
                            "bricks": [
                                {
                                    "id": "e9872fe2-a408-b9d9-dbdc-254f3a6cfe1f"
                                }
                            ]
                        }
                    ],
                    "id": "e5d6b849-2e39-b607-91ed-70db36021b4d"
                },
                {
                    "columns": [
                        {
                            "bricks": [
                                {
                                    "id": "d3fd5c9d-462b-4b93-724c-45cd649012ee"
                                }
                            ]
                        }
                    ],
                    "id": "32b8a826-c77d-f298-402d-fbea9a973a09"
                },
                {
                    "columns": [
                        {
                            "bricks": [
                                {
                                    "id": "68b9f8eb-69e6-6d39-bc21-0457ab4f7baa"
                                }
                            ]
                        }
                    ],
                    "id": "8eb433c4-9a49-640e-79d4-48b60ac19b39"
                },
                {
                    "columns": [
                        {
                            "bricks": [
                                {
                                    "id": "4159404b-3956-5d17-248c-8928262ae450"
                                }
                            ]
                        }
                    ],
                    "id": "2e6e1221-bdcb-714c-1a37-14395971c6bd"
                },
                {
                    "columns": [
                        {
                            "bricks": [
                                {
                                    "id": "5358e582-eee3-a5db-8189-fe8f3892ba69"
                                }
                            ]
                        }
                    ],
                    "id": "48a35035-321f-b610-9f64-3c732688b92b"
                },
                {
                    "columns": [
                        {
                            "bricks": [
                                {
                                    "id": "e6ca18ee-d0b6-151a-0948-cd607ed70609"
                                }
                            ]
                        }
                    ],
                    "id": "036eb1af-81f6-5e56-2342-61f0c2671e53"
                }
            ]
        }
    }
    ;

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
