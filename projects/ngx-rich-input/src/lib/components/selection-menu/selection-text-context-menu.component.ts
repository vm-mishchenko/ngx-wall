import {Component, Inject, OnInit} from '@angular/core';
import {STICKY_MODAL_DATA} from 'ngx-sticky-modal';

@Component({
  templateUrl: './selection-text-context-menu.component.html',
  styles: [`
      :host {
          background: white;
      }
  `]
})

export class SelectionTextContextMenuComponent implements OnInit {
  constructor(@Inject(STICKY_MODAL_DATA) public config: any) {
  }

  ngOnInit() {
  }
}
