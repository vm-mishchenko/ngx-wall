import {ActiveDescendantKeyManager, Highlightable} from '@angular/cdk/a11y';
import {ENTER} from '@angular/cdk/keycodes';
import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
  ViewContainerRef
} from '@angular/core';
import {combineLatest, Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

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
  @Input() stream: Observable<any>;
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
      <div [class.active]="isActive">
          <ng-container *ngTemplateOutlet="template; context: context;"></ng-container>
      </div>
  `,
  styles: [`
      .active {
          background: silver;
      }
  `]
})
export class ItemRenderer implements Highlightable {
  @Input() context: any;
  @Input() template: TemplateRef<any>;
  isActive = false;

  onItemClick(item) {
    console.log(`clicked on ${item} item.`);
  }

  setActiveStyles() {
    this.isActive = true;
  }

  setInactiveStyles() {
    this.isActive = false;
  }
}

@Component({
  selector: 'list-renderer',
  template: `
      <ng-container *ngFor="let item of (stream | async); trackBy: itemTrack">
          <item-renderer [template]="template" [context]="{$implicit: item}"></item-renderer>
      </ng-container>
  `
})
export class ListRenderer implements AfterViewInit {
  @Input() stream: Observable<any[]>;
  @Input() template: TemplateRef<any>;
  @Output() itemsRendererQueryList: Observable<QueryList<ItemRenderer>> = new Subject<QueryList<ItemRenderer>>();

  @ViewChildren(ItemRenderer) items: QueryList<ItemRenderer>;

  itemTrack(index, item) {
    return item.id;
  }

  ngAfterViewInit() {
    (this.itemsRendererQueryList as Subject<QueryList<ItemRenderer>>).next(this.items);

    this.items.changes.subscribe((changes) => {
      (this.itemsRendererQueryList as Subject<QueryList<ItemRenderer>>).next(changes);
    });
  }
}

@Component({
  selector: 'lib-ngx-input-projection',
  template: `
      <ng-container mainOutlet></ng-container>`,
})
export class NgxInputProjectionComponent implements AfterContentInit, AfterViewInit, OnDestroy {
  @Input() keyStream$: Observable<KeyboardEvent>;
  @Output() value: EventEmitter<unknown> = new EventEmitter<unknown>();

  @ViewChild(MainOutlet) _mainOutlet: MainOutlet;
  @ContentChildren(CdkPanelItem) _allItems: QueryList<CdkPanelItem>;
  @ContentChildren(CdkInputProjectionDef) _contentColumnDefs: QueryList<CdkInputProjectionDef>;

  private items: QueryList<ItemRenderer> = new QueryList();

  private destroyed$ = new Subject<boolean>();

  private itemsRendererQueries$: Observable<QueryList<ItemRenderer>>[];

  private keyManager: ActiveDescendantKeyManager<ItemRenderer>;

  constructor(private resolver: ComponentFactoryResolver) {
  }

  ngAfterContentInit() {
    const factory = this.resolver.resolveComponentFactory(ListRenderer);

    // render all panels and gather item-renderer output streams
    this.itemsRendererQueries$ = this._contentColumnDefs.map((_contentColumnDef) => {
      console.log(this._mainOutlet);

      const itemRenderer = this._mainOutlet.viewContainer.createComponent(factory);
      itemRenderer.instance.template = _contentColumnDef.item.template;
      itemRenderer.instance.stream = _contentColumnDef.stream;

      return itemRenderer.instance.itemsRendererQueryList;
    });

    combineLatest(this.itemsRendererQueries$).pipe(
      takeUntil(this.destroyed$)
    ).subscribe((itemsRendererQueries) => {
      const flattenItemRenderer = itemsRendererQueries.map((query) => query.toArray())
        .reduce((result, arr) => {
          result = result.concat(arr);
          return result;
        }, []);

      this.items.reset(flattenItemRenderer);
      this.items.notifyOnChanges();
    });
  }

  ngAfterViewInit() {
    this.keyManager = new ActiveDescendantKeyManager(this.items).withWrap();

    this.keyStream$.subscribe((event) => {
      if (event.keyCode === ENTER) {
        this.value.emit(this.keyManager.activeItem.context.$implicit);
      } else {
        this.keyManager.onKeydown(event);
      }
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
  }
}
