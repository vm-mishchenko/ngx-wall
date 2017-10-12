import { Component } from '@angular/core';
import { IWallConfiguration, IWallDefinition, WALL, WallApi } from 'wall';

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
                "id": "46d291d5-b057-8798-00af-ed9ba015fcda",
                "tag": "header",
                "data": {
                    "text": "WALL"
                },
                "meta": {}
            },
            {
                "id": "5cb0d4dd-24fa-de29-8785-619747830add",
                "tag": "quote",
                "data": {
                    "text": "The goal of the project is to create extensible web editor which provides clear and simple API for adding new type of editors (bricks) based on Angular components."
                },
                "meta": {}
            },
            {
                "id": "9f8e4cb8-d632-71b1-a1cc-89bf3ff8c96f",
                "tag": "header",
                "data": {
                    "text": "Navigation\n"
                },
                "meta": {}
            },
            {
                "id": "a3acc3a3-53d5-70ec-b374-90d6d39e2743",
                "tag": "text",
                "data": {
                    "text": "Press `Escape` to enter to Selection mode"
                },
                "meta": {}
            },
            {
                "id": "20307eb4-6c6a-0481-cf3d-af2c17b0487e",
                "tag": "text",
                "data": {
                    "text": "Press Shift to select few bricks"
                },
                "meta": {}
            },
            {
                "id": "2d7f65b4-ea8a-a86c-e99c-dd57c858d58d",
                "tag": "header",
                "data": {
                    "text": "Roadmap\n"
                },
                "meta": {}
            },
            {
                "id": "4edc3d51-cf7c-6648-a4fe-fe9418ea6c17",
                "tag": "text",
                "data": {
                    "text": "- improve selection experience for media bricks"
                },
                "meta": {}
            },
            {
                "id": "74928e82-54d8-c166-1e17-0de2b174bb02",
                "tag": "text",
                "data": {
                    "text": "- improve re-rendering algorithm"
                },
                "meta": {}
            },
            {
                "id": "0a182d45-04c0-3852-7899-9ad9fc90d6a2",
                "tag": "text",
                "data": {
                    "text": "- support readonly mode"
                },
                "meta": {}
            },
            {
                "id": "a855168e-2e86-8c59-24bc-a7a6f0c3245d",
                "tag": "header",
                "data": {
                    "text": "Supported tags\n"
                },
                "meta": {}
            },
            {
                "id": "a587554d-5698-8988-0039-ae1db771695e",
                "tag": "text",
                "data": {
                    "text": "/h header"
                },
                "meta": {}
            },
            {
                "id": "1147c417-c1ad-2550-7d96-bc5bd02470cb",
                "tag": "text",
                "data": {
                    "text": "/img image"
                },
                "meta": {}
            },
            {
                "id": "2e1c3c38-e75c-2c45-df3e-af887b258571",
                "tag": "d",
                "data": {},
                "meta": {}
            },
            {
                "id": "bf6077f7-0dda-9d7c-5fc8-dcd5bccb621e",
                "tag": "text",
                "data": {
                    "text": "/quote quote"
                },
                "meta": {}
            },
            {
                "id": "cd73851a-16fe-5363-5274-bd9adb27af06",
                "tag": "text",
                "data": {
                    "text": "/d divider"
                },
                "meta": {}
            },
            {
                "id": "e3a9d696-55bc-46d7-7009-a33774934aef",
                "tag": "v",
                "data": {
                    "src": "https://www.youtube.com/embed/YR5ApYxkU-U"
                },
                "meta": {}
            },
            {
                "id": "78fcc4fb-372e-a7c5-245a-26d6263790bc",
                "tag": "d",
                "data": {},
                "meta": {}
            },
            {
                "id": "299f6ef7-6c2e-dcd0-c591-de6733195437",
                "tag": "text",
                "data": {},
                "meta": {}
            },
            {
                "id": "669f8a76-a4a7-8cbe-a15a-c77149194a85",
                "tag": "text",
                "data": {
                    "text": "/v video"
                },
                "meta": {}
            }
        ],
        "layout": {
            "bricks": [
                {
                    "columns": [
                        {
                            "bricks": [
                                {
                                    "id": "46d291d5-b057-8798-00af-ed9ba015fcda"
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
                                    "id": "78fcc4fb-372e-a7c5-245a-26d6263790bc"
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
                                    "id": "5cb0d4dd-24fa-de29-8785-619747830add"
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
                                    "id": "299f6ef7-6c2e-dcd0-c591-de6733195437"
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
                                    "id": "e3a9d696-55bc-46d7-7009-a33774934aef"
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
                                    "id": "2e1c3c38-e75c-2c45-df3e-af887b258571"
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
                                    "id": "9f8e4cb8-d632-71b1-a1cc-89bf3ff8c96f"
                                },
                                {
                                    "id": "a3acc3a3-53d5-70ec-b374-90d6d39e2743"
                                },
                                {
                                    "id": "20307eb4-6c6a-0481-cf3d-af2c17b0487e"
                                }
                            ]
                        },
                        {
                            "bricks": [
                                {
                                    "id": "2d7f65b4-ea8a-a86c-e99c-dd57c858d58d"
                                },
                                {
                                    "id": "4edc3d51-cf7c-6648-a4fe-fe9418ea6c17"
                                },
                                {
                                    "id": "74928e82-54d8-c166-1e17-0de2b174bb02"
                                },
                                {
                                    "id": "0a182d45-04c0-3852-7899-9ad9fc90d6a2"
                                }
                            ]
                        },
                        {
                            "bricks": [
                                {
                                    "id": "a855168e-2e86-8c59-24bc-a7a6f0c3245d"
                                },
                                {
                                    "id": "a587554d-5698-8988-0039-ae1db771695e"
                                },
                                {
                                    "id": "bf6077f7-0dda-9d7c-5fc8-dcd5bccb621e"
                                },
                                {
                                    "id": "cd73851a-16fe-5363-5274-bd9adb27af06"
                                },
                                {
                                    "id": "1147c417-c1ad-2550-7d96-bc5bd02470cb"
                                },
                                {
                                    "id": "669f8a76-a4a7-8cbe-a15a-c77149194a85"
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