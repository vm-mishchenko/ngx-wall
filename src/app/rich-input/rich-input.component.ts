import {Component, OnInit} from '@angular/core';
import {IRichInputConfig} from '../../../projects/ngx-rich-input/src/lib/rich-input.component';

@Component({
  template: 'edit'
})
class RichInputEditAttrsComponent {
}

@Component({
  template: `
      <rich-input [config]="config"></rich-input>
  `,
  styleUrls: [`./rich-input.component.scss`]
})
export class RichInputComponent implements OnInit {
  config: IRichInputConfig = {
    marks: [
      {
        name: 'snippet',
        wrapSymbol: '`',
        tag: 'snippet',
      },
      {
        name: 'highlight',
        wrapSymbol: '~',
        tag: 'highlight',
        hotKey: 'Ctrl-h',
        attrs: {
          defaultAttrs() {
            return {};
          },
          editAttrsComp: RichInputEditAttrsComponent
        }
      }
    ]
  };

  constructor() {
  }

  ngOnInit() {

  }
}
