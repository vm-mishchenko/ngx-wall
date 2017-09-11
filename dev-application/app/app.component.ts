import { ChangeDetectorRef, Component } from '@angular/core';
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
        'bricks': [
            {
                'id': 'b631913d-84c5-5c7b-ecf0-714453a883f2',
                'tag': 'header',
                'data': {
                    'text': 'Wall editor'
                },
                'meta': {}
            },
            {
                'id': '13e25e42-ae37-0ee6-8bf2-fd7f78bf8762',
                'tag': 'text',
                'data': {
                    'text': 'Extensible editor based on Angular 2+'
                },
                'meta': {}
            },
            {
                'id': '89399ff0-2d1a-bbd3-68ae-a55045571c4b',
                'tag': 'text',
                'data': {
                    'text': ''
                },
                'meta': {}
            },
            {
                'id': 'cf7a2e00-5016-8b6d-b238-78c4b83b4468',
                'tag': 'img',
                'data': {
                    'src': 'https://cdn3.volusion.com/mache.udhvk/v/vspfiles/photos/M8994-PARENT-2.jpg'
                },
                'meta': {}
            },
            {
                'id': '4f3ce9ed-bebc-17e7-c23a-2cc64027ed09',
                'tag': 'header',
                'data': {
                    'text': 'Roadmap'
                },
                'meta': {}
            },
            {
                'id': '4b089695-bad3-06eb-f782-239c340864f3',
                'tag': 'text',
                'data': {
                    'text': '- drag\'n\'drop support'
                },
                'meta': {}
            },
            {
                'id': '878eca6b-5c7b-0cfa-c9ad-71481879d3e3',
                'tag': 'text',
                'data': {
                    'text': '- support few editors on the page'
                },
                'meta': {}
            }
        ],
        'layout': {
            'bricks': [
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': 'b631913d-84c5-5c7b-ecf0-714453a883f2'
                                },
                                {
                                    'id': '13e25e42-ae37-0ee6-8bf2-fd7f78bf8762'
                                },
                                {
                                    'id': '4f3ce9ed-bebc-17e7-c23a-2cc64027ed09'
                                },
                                {
                                    'id': '4b089695-bad3-06eb-f782-239c340864f3'
                                },
                                {
                                    'id': '878eca6b-5c7b-0cfa-c9ad-71481879d3e3'
                                },
                                {
                                    'id': '89399ff0-2d1a-bbd3-68ae-a55045571c4b'
                                },
                                {
                                    'id': 'cf7a2e00-5016-8b6d-b238-78c4b83b4468'
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    };

    documentationWallConfiguration = {
        mode: WALL.MODES.READ,
    };

    documentationWallPlan: IWallDefinition = {
        'bricks': [
            {
                'id': '4b72280e-1b98-d62c-51c3-525552b64f1c',
                'tag': 'header',
                'data': {
                    'text': 'Support tags'
                },
                'meta': {}
            },
            {
                'id': 'bab06a7e-f19a-9133-1cbc-46f7888a450c',
                'tag': 'text',
                'data': {
                    'text': '- /h - header'
                },
                'meta': {}
            },
            {
                'id': '20d86ae4-02b8-3fbf-52ec-aea4f3cef846',
                'tag': 'text',
                'data': {
                    'text': '- /img - image'
                },
                'meta': {}
            },
            {
                'id': '9bb9e2d7-c03f-4c04-00f9-8b663f9a527e',
                'tag': 'header',
                'data': {
                    'text': 'Navigation'
                },
                'meta': {}
            },
            {
                'id': '585853cc-230c-ef25-7d4e-b29e7d128367',
                'tag': 'text',
                'data': {
                    'text': 'Press Escape to enable Selection mode'
                },
                'meta': {}
            },
            {
                'id': '7ce6c9b8-4445-28b0-4a99-887d481aac6c',
                'tag': 'text',
                'data': {
                    'text': 'Press Shift to select few bricks'
                },
                'meta': {}
            },
            {
                'id': '0950f1bf-9767-9473-be03-8d13a90b1eb3',
                'tag': 'header',
                'data': {
                    'text': 'Mode'
                },
                'meta': {}
            },
            {
                'id': '7b6bf245-d1f1-3f46-55db-dc09549c3517',
                'tag': 'text',
                'data': {
                    'text': 'Press Escape to Enter to Selection mode\n\nPress Shift in selection mode to select few bricks\n'
                },
                'meta': {}
            }
        ],
        'layout': {
            'bricks': [
                {
                    'columns': [
                        {
                            'bricks': [
                                {
                                    'id': '4b72280e-1b98-d62c-51c3-525552b64f1c'
                                },
                                {
                                    'id': 'bab06a7e-f19a-9133-1cbc-46f7888a450c'
                                },
                                {
                                    'id': '20d86ae4-02b8-3fbf-52ec-aea4f3cef846'
                                },
                                {
                                    'id': '9bb9e2d7-c03f-4c04-00f9-8b663f9a527e'
                                },
                                {
                                    'id': '585853cc-230c-ef25-7d4e-b29e7d128367'
                                },
                                {
                                    'id': '7ce6c9b8-4445-28b0-4a99-887d481aac6c'
                                },
                                {
                                    'id': '0950f1bf-9767-9473-be03-8d13a90b1eb3'
                                },
                                {
                                    'id': '7b6bf245-d1f1-3f46-55db-dc09549c3517'
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    };

    constructor(private changeDetectorRef: ChangeDetectorRef) {
    }

    onRegisterApi(wallApi: WallApi) {
        this.wallApi = wallApi;

        // subscribe to all core events
        wallApi.core.subscribe((event: any) => {
            // update current plan
            this.plan = wallApi.core.getPlan();
        });

        // use logger feature provided by Logger plugin
        wallApi.features.logger.log('Use Logger plugin');

        this.plan = wallApi.core.getPlan();
    }
}