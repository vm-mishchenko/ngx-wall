import {ActiveDescendantKeyManager, Highlightable} from '@angular/cdk/a11y';
import {DOWN_ARROW, ENTER, UP_ARROW} from '@angular/cdk/keycodes';
import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  ContentChild,
  ContentChildren,
  Directive,
  EventEmitter,
  forwardRef,
  HostListener,
  Inject,
  Input,
  OnDestroy,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
  ViewContainerRef
} from '@angular/core';
import {MatRipple} from '@angular/material';
import {combineLatest, Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Directive({
  selector: '[cdkPanelItem]'
})
export class CdkPanelItem {
  constructor(public template: TemplateRef<any>) {
  }
}

@Directive({
  selector: '[cdkPanelItemTitle]'
})
export class CdkPanelItemTitle {
  constructor(public template: TemplateRef<any>) {
  }
}

@Directive({
  selector: '[cdkInputProjectionDef]'
})
export class CdkInputProjectionDef {
  /** Unique name for this item. */
  @Input() stream: Observable<any>;
  @ContentChild(CdkPanelItem) body: CdkPanelItem;
  @ContentChild(CdkPanelItemTitle) title: CdkPanelItemTitle;
}

@Directive({selector: '[mainOutlet]'})
export class MainOutlet {
  constructor(public viewContainer: ViewContainerRef) {
  }
}

@Component({
  selector: 'item-renderer',
  template: `
      <div matRipple [class.active]="isActive">
          <ng-container *ngTemplateOutlet="template; context: context;"></ng-container>
      </div>
  `
})
export class ItemRenderer implements Highlightable {
  @Input() context: any;
  @Input() template: TemplateRef<any>;

  /** Reference to the directive instance of the ripple. */
  @ViewChild(MatRipple) rippleInstance: MatRipple;

  constructor(@Inject(forwardRef(() => InputProjectionComponent)) private ngxInputProjectionComponent: InputProjectionComponent) {
  }

  isActive = false;

  @HostListener('click')
  handleClick() {
    this.ngxInputProjectionComponent.clicked(this, this.context);
  }

  setActiveStyles() {
    this.isActive = true;
  }

  setInactiveStyles() {
    this.isActive = false;
  }

  ripple() {
    const rippleRef = this.rippleInstance.launch({
      persistent: true,
      centered: false
    });

    // Fade out the ripple later.
    setTimeout(() => {
      rippleRef.fadeOut();
    }, 500);
  }
}

@Component({
  selector: 'list-renderer',
  template: `
      <div *ngIf="(stream | async)?.length">
          <ng-container *ngTemplateOutlet="title;"></ng-container>
      </div>
      <div>
          <item-renderer *ngFor="let item of (stream | async); trackBy: itemTrack"
                         [template]="body" [context]="{$implicit: item}"></item-renderer>
      </div>
  `
})
export class ListRenderer implements AfterViewInit {
  @Input() stream: Observable<any[]>;
  @Input() body: TemplateRef<any>;
  @Input() title: TemplateRef<any>;
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
  selector: 'input-projection',
  template: `
      <ng-container mainOutlet></ng-container>`,
})
export class InputProjectionComponent implements AfterContentInit, AfterViewInit, OnDestroy {
  @Input() keyStream$: Observable<KeyboardEvent>;
  @Output() value: EventEmitter<unknown> = new EventEmitter<unknown>();

  @ViewChild(MainOutlet) _mainOutlet: MainOutlet;
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
      const listRenderer = this._mainOutlet.viewContainer.createComponent(factory);
      listRenderer.instance.title = _contentColumnDef.title.template;
      listRenderer.instance.body = _contentColumnDef.body.template;
      listRenderer.instance.stream = _contentColumnDef.stream;

      return listRenderer.instance.itemsRendererQueryList;
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
      if (event.keyCode === DOWN_ARROW || event.keyCode === UP_ARROW) {
        event.preventDefault();
      }

      if (event.keyCode === ENTER) {
        this.keyManager.activeItem.ripple();
        this.value.emit(this.keyManager.activeItem.context.$implicit);
      } else {
        this.keyManager.onKeydown(event);
      }
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
  }

  clicked(clickedItem: ItemRenderer, context) {
    this.setActiveItem(clickedItem);
    this.value.emit(context.$implicit);
  }

  private setActiveItem(newActiveItem: ItemRenderer) {
    const index = this.items.toArray().findIndex((currentItem) => {
      return currentItem === newActiveItem;
    });

    if (index !== -1) {
      this.keyManager.setActiveItem(index);
    }
  }
}
