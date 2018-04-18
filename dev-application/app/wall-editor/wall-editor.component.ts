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

    wallPlan: IWallDefinition =   {
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
                    "text": ""
                }
            },
            {
                "id": "8fcd790b-2b3d-b839-c01d-4a0ba1213735",
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
                                    "id": "8fcd790b-2b3d-b839-c01d-4a0ba1213735"
                                }
                            ]
                        }
                    ],
                    "id": "ed78ad88-2346-dbdb-b0c3-e4511ddfe4bb"
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
