import {Component, Injector, OnInit} from '@angular/core';
import {
  CopyPlugin,
  IWallConfiguration,
  IWallDefinition,
  IWallDefinition2,
  IWallModel,
  IWallModelConfig2,
  SelectionPlugin,
  UndoRedoPlugin,
  WALL,
  WallModelFactory
} from 'ngx-wall';

@Component({
  selector: 'app-wall-editor',
  templateUrl: 'wall-editor.component.html'
})
export class WallEditorComponent implements OnInit {
  wallConfiguration: IWallConfiguration = {
    mode: WALL.MODES.EDIT
  };

  wallPlan: IWallDefinition = {
    'bricks': [
      {
        'id': '82600916-c474-c669-7a0a-a362fb134a69',
        'tag': 'text',
        'meta': {},
        'data': {}
      }
    ],
    'layout': {
      'bricks': [
        {
          'columns': [
            {
              'bricks': [
                {
                  'id': '82600916-c474-c669-7a0a-a362fb134a69'
                }
              ]
            }
          ],
          'id': '78602cb8-f52d-afb7-c9a8-522cfe9be303'
        },
        {
          'columns': [
            {
              'bricks': []
            }
          ],
          'id': '5b2daedf-d03f-d3f7-9ce9-6e2c47725db3'
        }
      ]
    }
  };

  wallPlan2: IWallDefinition2 = [
    {
      'id': '82600916-c474-c669-7a0a-a362fb134a63',
      'tag': 'text',
      'meta': {},
      'data': {
      }
    },
  ];

  wallModel: IWallModel;

  constructor(private wallModelFactory: WallModelFactory,
              private injector: Injector) {
    const modelConfig: IWallModelConfig2 = {
      plan: this.wallPlan2,
      plugins: [
        new CopyPlugin(this.injector),
        new UndoRedoPlugin(this.injector),
        new SelectionPlugin(this.injector)
      ]
    };

    this.wallModel = this.wallModelFactory.create(modelConfig);
  }

  ngOnInit() {
  }
}
