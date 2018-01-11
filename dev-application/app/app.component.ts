import { Component, OnInit } from '@angular/core';
import { IWallConfiguration, IWallDefinition, WALL, WallApi, WallModelFactory } from 'wall';

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

    wallConfiguration: IWallConfiguration = {
        mode: WALL.MODES.EDIT,

        onRegisterApi: this.onRegisterApi.bind(this)
    };

    wallPlan: IWallDefinition = {
        "bricks": [
            {
                "id": "38c858a3-d4eb-649b-220b-e8a570ce9808",
                "tag": "img",
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
                                    "id": "38c858a3-d4eb-649b-220b-e8a570ce9808"
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
