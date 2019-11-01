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
        inclusive: true,
      },
      {
        name: 'highlight',
        wrapSymbol: '~',
        hotKey: 'Ctrl-h',
        inclusive: true
      },
      {
        name: 'link',
        tag: 'a',
        inclusive: true,
        attrs: {
          attrs: {href: {}},
          defaultAttrs() {
            return {
              href: 'http://google.com'
            };
          },
          editAttrsComp: RichInputEditAttrsComponent,
          parseDOM: [{
            tag: 'a',
            getAttrs: function (dom) {
              return {
                href: dom.href
              };
            }
          }],
          toDOM: function toDOM(node) {
            return ['a', {href: node.attrs.href}, 0];
          }
        }
      }
    ]
  };

  constructor() {
  }

  ngOnInit() {
  }
}
