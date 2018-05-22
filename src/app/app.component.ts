import {Component} from '@angular/core';
import {IWallConfiguration, IWallDefinition, WALL, WallApi, WallModelFactory} from 'ngx-wall';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
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
        'id': 'a9c91b70-01b0-8be0-4bd5-6a8a8379fd51',
        'tag': 'text',
        'meta': {},
        'data': {}
      },
      {
        'id': 'd5075777-eb67-2dce-f634-a82b3221234b',
        'tag': 'header',
        'meta': {},
        'data': {
          'text': 'Link brick'
        }
      },
      {
        'id': '392c098a-2812-7a7a-05e1-d9f99215bde3',
        'tag': 'text',
        'meta': {},
        'data': {
          'text': ''
        }
      },
      {
        'id': '26849e5b-bb47-b7cd-d8cc-a5636291b977',
        'tag': 'text',
        'meta': {},
        'data': {
          'text': 'He determined to drop his litigation with the monastry, and relinguish his claims to the wood-cuting and fishery rihgts at<b> once. He<a href="http://google.com"> was the m</a>ore ready to <a href="http://google.com">do this</a> becuase the rig<a href="http://google.com">hts had </a>becom much less valuable, and</b> he had indeed the vaguest idea where the wood and river in quedtion were.'
        }
      },
      {
        'id': '8f1df00e-6c4a-0d5d-666e-11c8d0ed8c29',
        'tag': 'text',
        'meta': {},
        'data': {
          'text': ''
        }
      },
      {
        'id': '1c11088a-836a-adc8-1b13-37fe88573b64',
        'tag': 'text',
        'meta': {},
        'data': {
          'text': ''
        }
      },
      {
        'id': '5693ab20-fe73-e8f4-3d38-c0fe5fee5231',
        'tag': 'text',
        'meta': {},
        'data': {}
      },
      {
        'id': '762d85d3-ee32-2431-57c8-a41f01960e73',
        'tag': 'text',
        'meta': {},
        'data': {
          'text': ''
        }
      },
      {
        'id': '28c421e4-fc9d-9ecc-0d8d-e781d060b4a7',
        'tag': 'text',
        'meta': {},
        'data': {
          'text': ''
        }
      }
    ],
    'layout': {
      'bricks': [
        {
          'columns': [
            {
              'bricks': [
                {
                  'id': 'a9c91b70-01b0-8be0-4bd5-6a8a8379fd51'
                }
              ]
            }
          ],
          'id': 'f30e6ee1-4dfd-8edc-927d-34b70945a377'
        },
        {
          'columns': [
            {
              'bricks': [
                {
                  'id': 'd5075777-eb67-2dce-f634-a82b3221234b'
                }
              ]
            }
          ],
          'id': 'ae73dbcf-4792-4818-dbb0-ccef60ad3002'
        },
        {
          'columns': [
            {
              'bricks': [
                {
                  'id': '392c098a-2812-7a7a-05e1-d9f99215bde3'
                }
              ]
            }
          ],
          'id': '6d318917-72b8-1140-3a1a-9fac42b70745'
        },
        {
          'columns': [
            {
              'bricks': [
                {
                  'id': '26849e5b-bb47-b7cd-d8cc-a5636291b977'
                }
              ]
            }
          ],
          'id': '20837e41-8ed8-6130-5ba5-8a9688d9243d'
        },
        {
          'columns': [
            {
              'bricks': [
                {
                  'id': '8f1df00e-6c4a-0d5d-666e-11c8d0ed8c29'
                }
              ]
            }
          ],
          'id': '1dff4793-4a45-2713-75a5-b213d391cc2b'
        },
        {
          'columns': [
            {
              'bricks': [
                {
                  'id': '1c11088a-836a-adc8-1b13-37fe88573b64'
                }
              ]
            }
          ],
          'id': 'cdf571bf-7283-0c4e-caaf-3d9801a1d76a'
        },
        {
          'columns': [
            {
              'bricks': [
                {
                  'id': '5693ab20-fe73-e8f4-3d38-c0fe5fee5231'
                }
              ]
            }
          ],
          'id': '8be50755-8b90-6506-713a-9ee61f34dc43'
        },
        {
          'columns': [
            {
              'bricks': [
                {
                  'id': '762d85d3-ee32-2431-57c8-a41f01960e73'
                }
              ]
            }
          ],
          'id': '9945dd65-704a-5ec1-081e-0f5668c55fa1'
        },
        {
          'columns': [
            {
              'bricks': [
                {
                  'id': '28c421e4-fc9d-9ecc-0d8d-e781d060b4a7'
                }
              ]
            }
          ],
          'id': '6a4ba685-b5fb-4af2-6f68-e5eb2c7b9a8d'
        }
      ]
    }
  };

  wall2Model: any;

  constructor(private wallModelFactory: WallModelFactory) {
    this.wall2Model = this.wallModelFactory.create();
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
