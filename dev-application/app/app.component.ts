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
                    "text": "- support read-only mode"
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
                "tag": "img",
                "data": {
                    "src": "https://vanda-production-assets.s3.amazonaws.com/2017/05/04/11/24/01/2b263b74-1f28-49bc-9f20-215f825f6e13/members-only-mornings-the-pink-floyd-exhibition_960.jpg"
                },
                "meta": {}
            },
            {
                "id": "669f8a76-a4a7-8cbe-a15a-c77149194a85",
                "tag": "text",
                "data": {
                    "text": "/v video"
                },
                "meta": {}
            },
            {
                "id": "cc72c194-ee44-4006-3d13-b6d2b980ec36",
                "tag": "img",
                "data": {
                    "src": "https://i.pinimg.com/736x/d3/11/85/d311857d38ed98cf957a144832a3a16c--david-gilmour-pink-floyd.jpg"
                },
                "meta": {}
            },
            {
                "id": "68f49a58-d328-e9bf-76cd-94c5a7c8375c",
                "tag": "img",
                "data": {
                    "src": "http://ultimateclassicrock.com/files/2016/11/Pink-FLoyd.jpg"
                },
                "meta": {}
            },
            {
                "id": "607eb464-0ef1-3eb9-7d70-1cf82f50c05a",
                "tag": "text",
                "data": {},
                "meta": {}
            },
            {
                "id": "c63c2fb1-b3e3-35f1-8466-b5281a62d4dc",
                "tag": "text",
                "data": {},
                "meta": {}
            },
            {
                "id": "ffd617f5-2ac7-fa58-ae78-142a304642a7",
                "tag": "text",
                "data": {},
                "meta": {}
            },
            {
                "id": "5d3c7fcc-f752-bcb5-a330-ab2da369d209",
                "tag": "text",
                "data": {
                    "text": "- clean up canvas code"
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
                                    "id": "ffd617f5-2ac7-fa58-ae78-142a304642a7"
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
                                    "id": "607eb464-0ef1-3eb9-7d70-1cf82f50c05a"
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
                                    "id": "cc72c194-ee44-4006-3d13-b6d2b980ec36"
                                }
                            ]
                        },
                        {
                            "bricks": [
                                {
                                    "id": "299f6ef7-6c2e-dcd0-c591-de6733195437"
                                }
                            ]
                        },
                        {
                            "bricks": [
                                {
                                    "id": "68f49a58-d328-e9bf-76cd-94c5a7c8375c"
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
                                    "id": "c63c2fb1-b3e3-35f1-8466-b5281a62d4dc"
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
                                    "id": "74928e82-54d8-c166-1e17-0de2b174bb02"
                                },
                                {
                                    "id": "5d3c7fcc-f752-bcb5-a330-ab2da369d209"
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