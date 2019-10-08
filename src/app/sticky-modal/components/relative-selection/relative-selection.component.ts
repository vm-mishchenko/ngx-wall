import {Component, ComponentFactoryResolver, ElementRef, OnInit, ViewChild} from '@angular/core';
import {StickyModalService, StickyPositionStrategy} from 'ngx-sticky-modal';
import {ModalComponent} from '../modal/modal.component';

@Component({
  selector: 'app-relative-selection',
  templateUrl: 'app-relative-selection.component.html'
})

export class RelativeSelectionComponent implements OnInit {
  @ViewChild('node') node: ElementRef;

  constructor(private ngxStickyModalService: StickyModalService,
              private componentFactoryResolver: ComponentFactoryResolver) {
  }

  ngOnInit() {
  }

  onMouseUp(event: MouseEvent) {
    this.ngxStickyModalService.open({
      component: ModalComponent,
      positionStrategy: {
        name: StickyPositionStrategy.coordinate,
        options: {
          clientX: event.clientX,
          clientY: event.clientY
        }
      },
      componentFactoryResolver: this.componentFactoryResolver
    });
  }
}
