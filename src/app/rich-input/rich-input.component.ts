import {Component, OnInit} from '@angular/core';
import {IRichInputConfig} from 'ngx-rich-input';
import {StickyModalRef} from 'ngx-sticky-modal';

@Component({
  template: '<button (click)="send()">Send</button>'
})
export class RichInputEditAttrsComponent {
  constructor(private stickyModalRef: StickyModalRef) {
  }

  send() {
    this.stickyModalRef.close({
      href: 'http://google.com'
    });
  }
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
        inclusive: true,
        attrs: {
          attrs: {color: {}},
          defaultAttrs() {
            return {
              color: 'red'
            };
          },
          parseDOM: [{
            tag: 'highlight',
            getAttrs: function (dom) {
              return {
                color: dom.color
              };
            }
          }],
          toDOM: function toDOM(node) {
            return ['highlight', {color: node.attrs.color}, 0];
          }
        }
      },
      {
        name: 'link',
        tag: 'a',
        inclusive: true,
        attrs: {
          attrs: {href: {}},
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
