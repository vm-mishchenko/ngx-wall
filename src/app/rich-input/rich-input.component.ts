import {Component, OnInit} from '@angular/core';

@Component({
  template: `
      <rich-input [config]="config"></rich-input>
  `,
  styleUrls: [`./rich-input.component.scss`]
})
export class RichInputComponent implements OnInit {
  config = {
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
      }
    ]
  };

  constructor() {
  }

  ngOnInit() {

  }
}
