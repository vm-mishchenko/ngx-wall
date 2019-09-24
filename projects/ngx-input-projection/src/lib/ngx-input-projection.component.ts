import {
  AfterContentInit,
  Component,
  ComponentFactoryResolver,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  Input,
  OnInit,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core';

@Directive({
  selector: '[cdkPanelItem]'
})
export class CdkPanelItem {
  constructor(public container: ViewContainerRef,
              public template: TemplateRef<any>) {
  }
}

@Directive({
  selector: '[cdkInputProjectionDef]'
})
export class CdkInputProjectionDef {
  /** Unique name for this item. */
  @Input('cdkInputProjectionDef') name: string;
  @ContentChild(CdkPanelItem) item: CdkPanelItem;
}

@Directive({
  selector: '[cdk-item]'
})
export class CdkItem {
  constructor(cdkInputProjectionDef: CdkInputProjectionDef, elementRef: ElementRef) {
    const itemClassName = `cdk-item-${cdkInputProjectionDef.name}`;
    elementRef.nativeElement.classList.add(itemClassName);
  }
}

@Directive({selector: '[mainOutlet]'})
export class MainOutlet {
  constructor(public viewContainer: ViewContainerRef, public elementRef: ElementRef) {
  }
}

@Component({
  selector: 'item-renderer',
  template: `
      <ng-container *ngFor="let item of data">
          <div (click)="onItemClick(item)">
              <ng-container *ngTemplateOutlet="template; context: {$implicit: item};"></ng-container>
          </div>
      </ng-container>
  `
})
export class ItemRenderer {
  @Input() data: any[];
  @Input() template: TemplateRef<any>;

  onItemClick(item) {
    console.log(`clicked on ${item} item.`);
  }
}

@Component({
  selector: 'lib-ngx-input-projection',
  template: `
      <ng-container mainOutlet></ng-container>`,
})
export class NgxInputProjectionComponent implements OnInit, AfterContentInit {
  @ViewChild(MainOutlet) _mainOutlet: MainOutlet;
  @ContentChildren(CdkPanelItem) _allItems: QueryList<CdkPanelItem>;
  @ContentChildren(CdkInputProjectionDef) _contentColumnDefs: QueryList<CdkInputProjectionDef>;

  constructor(private resolver: ComponentFactoryResolver) {
  }

  ngOnInit() {

  }

  ngAfterContentInit() {
    const factory = this.resolver.resolveComponentFactory(ItemRenderer);

    this._contentColumnDefs.forEach((_contentColumnDef) => {
      const itemRenderer = this._mainOutlet.viewContainer.createComponent(factory);

      itemRenderer.instance.template = _contentColumnDef.item.template;
      itemRenderer.instance.data = [1, 2, 3];
    });
  }
}
