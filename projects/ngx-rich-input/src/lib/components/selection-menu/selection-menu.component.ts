import {Component, OnInit} from '@angular/core';

@Component({
  templateUrl: './selection-menu.component.html',
  styles: [`
      :host {
          background: red;
      }
  `]
})

export class SelectionMenuComponent implements OnInit {
  constructor() {
  }

  ngOnInit() {
  }
}
