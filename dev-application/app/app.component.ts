import { Component, OnInit } from '@angular/core';
import { WALL, WallApi, WallConfiguration, WallDefinition, WallModelFactory } from 'wall';

@Component({
    selector: 'my-app',
    templateUrl: './app.component.html',
    styles: [`
        .wrapper {
            width: 800px;
            margin: 0 auto;
        }
    `]
})
export class AppComponent implements OnInit {
    plan: any = null;

    wallApi: WallApi = null;

    wallConfiguration: WallConfiguration = {
        mode: WALL.MODES.EDIT,

        onRegisterApi: this.onRegisterApi.bind(this)
    };

    wallPlan: WallDefinition = {
        "bricks": [
            {
                "id": "7250edce-d42f-4719-56c4-f9872fce3332",
                "tag": "text",
                "meta": {},
                "data": {
                    "text": "1 Deletes the selection's content from the document"
                }
            },
            {
                "id": "d30cb4b0-afe9-58fc-2bc7-bfd43f5683e1",
                "tag": "text",
                "meta": {},
                "data": {
                    "text": "2 Deletes the selection's content from the document Deletes the selection's content from the document Deletes the selection's content from the document Deletes the selection's content from the document"
                }
            },
            {
                "id": "d10bc6ae-f143-44f0-bf10-b80beacff402",
                "tag": "text",
                "meta": {},
                "data": {
                    "text": "3 Deletes the selection's content from the document"
                }
            },
            {
                "id": "c3da5e37-85e1-5f58-fbb3-446192aa3dc5",
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
                                    "id": "7250edce-d42f-4719-56c4-f9872fce3332"
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
                                    "id": "d30cb4b0-afe9-58fc-2bc7-bfd43f5683e1"
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
                                    "id": "d10bc6ae-f143-44f0-bf10-b80beacff402"
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
                                    "id": "c3da5e37-85e1-5f58-fbb3-446192aa3dc5"
                                }
                            ]
                        }
                    ]
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