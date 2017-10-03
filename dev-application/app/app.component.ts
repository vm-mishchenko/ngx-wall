import {Component} from '@angular/core';
import {IWallConfiguration, IWallDefinition, WALL, WallApi} from 'wall';

@Component({
    selector: 'my-app',
    templateUrl: './app.component.html'
})
export class AppComponent {
    plan: any = null;

    wallApi: WallApi = null;

    wallConfiguration: IWallConfiguration = {
        mode: WALL.MODES.EDIT,

        onRegisterApi: this.onRegisterApi.bind(this)
    };

    wallPlan: IWallDefinition = {
        "bricks": [
            {
                "id": "b631913d-84c5-5c7b-ecf0-714453a883f2",
                "tag": "text",
                "data": {
                    "text": "WALL"
                },
                "meta": {}
            },
            {
                "id": "13e25e42-ae37-0ee6-8bf2-fd7f78bf8762",
                "tag": "text",
                "data": {
                    "text": "The goal of the project is to create extensible web editor which provides clear and simple API for adding new type of editors (bricks) based on Angular components."
                },
                "meta": {}
            }
        ],
        "layout": {
            "bricks": [
                {
                    columns: [
                        {
                            bricks: [
                                {
                                    id: 'b631913d-84c5-5c7b-ecf0-714453a883f2'
                                }
                            ]
                        }
                    ]
                },
                {
                    columns: [
                        {
                            bricks: [
                                {
                                    id: '13e25e42-ae37-0ee6-8bf2-fd7f78bf8762'
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    };

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