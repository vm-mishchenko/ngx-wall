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
        "bricks": [
            {
                "id": "120251b2-0c70-89c6-5888-8f3d292b0404",
                "tag": "text",
                "meta": {},
                "data": {
                    'text': 'Miusov, as a man man of breeding and deilcacy, could not but feel some inwrd qualms, when he reached the Father Superior\'s with Ivan. Miusov, as a man man of breeding and deilcacy, could not but feel some inwrd qualms, when he reached the Father Superior\'s with Ivan.'
                }
            },
            {
                "id": "0d0564e7-abc3-20fb-702d-26181fb15eaf",
                "tag": "text",
                "meta": {},
                "data": {
                    "text": "Miusov, as a man man of breeding and deilcacy, could not but feel some inwrd qualms, when he reached the Father Superior. iusov, as a man man of breeding and deilcacy, could not but feel some inwrd qualms, when he reached the Father Superior. iusov, as a man man of breeding and deilcacy, could not but feel some inwrd qualms, when he reached the Father Superior"
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
                                    "id": "120251b2-0c70-89c6-5888-8f3d292b0404"
                                }
                            ]
                        }
                    ],
                    "id": "692a5708-a899-7b78-7bb4-52e01ea878ad"
                },
                {
                    "columns": [
                        {
                            "bricks": []
                        }
                    ],
                    "id": "ab1a3a23-24f1-f7a4-3e11-ebcfd9f5d418"
                },
                {
                    "columns": [
                        {
                            "bricks": [
                                {
                                    "id": "0d0564e7-abc3-20fb-702d-26181fb15eaf"
                                }
                            ]
                        }
                    ],
                    "id": "e5d238b8-d1d8-f209-c160-5bc49209fe96"
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
