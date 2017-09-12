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
                    'text': 'The goal of the project is to create extensible web editor which provides clear and simple API for adding new type of editors (bricks) based on Angular components.'
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
            },
            {
                'id': '30ee9fac-991f-ec6f-5b08-801d00d760a4',
                'tag': 'header',
                'data': {
                    'text': 'Supported tags'
                },
                'meta': {}
            },
            {
                'id': '4cf44a15-d08e-399d-38ba-c051a36f6574',
                'tag': 'text',
                'data': {
                    'text': '/h header brick'
                },
                'meta': {}
            },
            {
                'id': '56be0630-1cd8-4997-b69c-e40421cf79da',
                'tag': 'text',
                'data': {
                    'text': '/img image brick'
                },
                'meta': {}
            },
            {
                'id': 'f936a755-108a-a259-1f00-3c7bdd5d5ced',
                'tag': 'header',
                'data': {
                    'text': 'Navigation'
                },
                'meta': {}
            },
            {
                'id': 'f796f546-57ce-49cb-9c1f-0479df9212b1',
                'tag': 'text',
                'data': {
                    'text': 'Press `Escape` to enter to Selection mode'
                },
                'meta': {}
            },
            {
                'id': 'f6333894-7e4d-2759-c425-9b7feda57801',
                'tag': 'text',
                'data': {
                    'text': 'Press Shift to select few bricks'
                },
                'meta': {}
            },
            {
                'id': '94339d03-f539-cded-bb5a-4273d05898d5',
                'tag': 'text',
                'data': {
                    'text': '- support readonly mode'
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
                                }
                            ]
                        },
                        {
                            'bricks': [
                                {
                                    'id': '30ee9fac-991f-ec6f-5b08-801d00d760a4'
                                },
                                {
                                    'id': '4cf44a15-d08e-399d-38ba-c051a36f6574'
                                },
                                {
                                    'id': '56be0630-1cd8-4997-b69c-e40421cf79da'
                                }
                            ]
                        },
                        {
                            'bricks': [
                                {
                                    'id': 'f936a755-108a-a259-1f00-3c7bdd5d5ced'
                                },
                                {
                                    'id': 'f796f546-57ce-49cb-9c1f-0479df9212b1'
                                },
                                {
                                    'id': 'f6333894-7e4d-2759-c425-9b7feda57801'
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
                                    'id': '94339d03-f539-cded-bb5a-4273d05898d5'
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

    constructor() {
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