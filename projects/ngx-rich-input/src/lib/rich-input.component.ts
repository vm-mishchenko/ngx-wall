import {Component, ComponentFactoryResolver, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {StickyModalRef, StickyModalService, StickyPositionStrategy} from 'ngx-sticky-modal';
import {baseKeymap} from 'prosemirror-commands';
import {keymap} from 'prosemirror-keymap';
import {history} from 'prosemirror-history';
import {DOMParser, DOMSerializer, Schema} from 'prosemirror-model';

import {marks, nodes} from 'prosemirror-schema-basic';
import {EditorState, TextSelection, Transaction} from 'prosemirror-state';
import {ReplaceStep} from 'prosemirror-transform';
import {EditorView} from 'prosemirror-view';
import {Subject} from 'rxjs';
import {SelectionTextContextMenuComponent} from './components/selection-menu/selection-text-context-menu.component';
import {debounceTime, filter, takeUntil} from 'rxjs/operators';

export interface IMark {
  name: string;
  // html tag for the mark, in case if it's not specified name will be used
  tag?: string;
  wrapSymbol?: string;
  hotKey?: string;
  attrs?: IAttr;
  inclusive: boolean;


  // overview component
  // show or not overview component automatically
  // action when cursor stays inside mark

  // show dialog after special symbol or hot key combination

  // hot key for selected text or cursor position - show summary from different plugins
  // translation, word meaning, open in google images
}

export interface IAttrMap {
  [key: string]: string;
}

export interface IAttr {
  attrs: any;

  // default mark attributes.
  // We assume that method returns complete list of all attributes values.
  defaultAttrs?: () => IAttrMap;

  // defines component for editing attributes
  editAttrsComp?: any;

  parseDOM: any[];
  toDOM: (node: any) => any[];
}

export interface IRichInputConfig {
  marks: IMark[];
}

interface IPlugin {
  name: string;

  keymap?: {
    [key: string]: () => any
  };

  onInitialize?(richInputModel: RichInputModel);

  transactionHook?(transaction: Transaction): boolean;

  onDestroy?();
}

/*
* 1. create mark by hot key
* 2. show menu with all registered marks
*/

/**
 * Root model.
 * Handle plugin configurations: take client specific and initialize core plugins.
 */
class RichInputModel {
  readonly richInputEditor: RichInputEditor;

  plugins: Map<string, IPlugin> = new Map();

  constructor(private container: HTMLElement,
              readonly config: IRichInputConfig,
              private ngxStickyModalService: StickyModalService,
              private componentFactoryResolver: ComponentFactoryResolver) {
    // plugin creation
    const markPlugin = new MarkPlugin();
    this.plugins.set(markPlugin.name, markPlugin);

    const markSymbolWrapperPlugin = new MarkSymbolWrapperPlugin();
    this.plugins.set(markSymbolWrapperPlugin.name, markSymbolWrapperPlugin);

    const marksMenuPlugin = new MarksMenuPlugin();
    this.plugins.set(marksMenuPlugin.name, marksMenuPlugin);

    const modalPlugin = new ModalPlugin(this.container, this.ngxStickyModalService, this.componentFactoryResolver);
    this.plugins.set(modalPlugin.name, modalPlugin);

    // configuring config for RichInputEditor based on plugins
    const pluginKeymap = Array.from(this.plugins.values()).filter((plugin) => {
      return plugin.keymap;
    }).reduce((result, plugin) => {
      result = {
        ...result,
        ...plugin.keymap
      };

      return result;
    }, {});

    const pluginTransactionHook = Array.from(this.plugins.values()).filter((plugin) => {
      return Boolean(plugin.transactionHook);
    }).map((plugin) => {
      return plugin.transactionHook.bind(plugin);
    });

    const clientCustomMarks = this.config.marks.reduce((result, markConfig) => {
      if (markConfig.attrs) {
        result[markConfig.name] = {
          attrs: markConfig.attrs.attrs,
          inclusive: markConfig.inclusive,
          parseDOM: markConfig.attrs.parseDOM,
          toDOM: markConfig.attrs.toDOM
        };
      } else {
        result[markConfig.name] = {
          inclusive: markConfig.inclusive,
          parseDOM: [{tag: markConfig.tag || markConfig.name}],
          toDOM: function toDOM() {
            return [markConfig.tag || markConfig.name, 0];
          }
        };
      }

      return result;
    }, {});

    this.richInputEditor = new RichInputEditor({
      container,
      keymap: pluginKeymap,
      transactionHook: pluginTransactionHook,
      marks: clientCustomMarks
    });

    // initialize plugins when all configurations is set and ready to work
    Array.from(this.plugins.values()).filter((plugin) => {
      return Boolean(plugin.onInitialize);
    }).forEach((plugin) => {
      return plugin.onInitialize(this);
    });
  }

  onDestroy() {
    Array.from(this.plugins.values()).filter((plugin) => {
      return plugin.onDestroy;
    }).forEach((plugin) => {
      plugin.onDestroy();
    });
  }
}

/**
 * Knows how to create mark, based on client provided config.
 */
class MarkPlugin {
  name = 'mark';

  private richInputModel: RichInputModel;

  onInitialize(richInputModel: RichInputModel) {
    this.richInputModel = richInputModel;
  }

  createMark(markName: string, from: number, to: number) {
    const markConfig = this.richInputModel.config.marks.find((mark) => {
      return mark.name === markName;
    });

    // mark does not any attribute, we could easily create it right a way
    console.log(`createMark`);
    if (!markConfig.attrs) {
      this.richInputModel.richInputEditor.clearTextSelection();
      this.richInputModel.richInputEditor.createMark(markName, from, to);
    } else {
      if (markConfig.attrs.defaultAttrs) {
        const defaultAttrs = markConfig.attrs.defaultAttrs();

        this.richInputModel.richInputEditor.clearTextSelection();
        this.richInputModel.richInputEditor.createMark(markConfig.name, from, to, defaultAttrs);
      }
    }
  }
}

/**
 * Creates marks if the text wrapped by symbols specified by the client.
 */
class MarkSymbolWrapperPlugin {
  name = 'mark-symbol-wrapper';

  private richInputModel: RichInputModel;

  private markPlugin: MarkPlugin;

  onInitialize(richInputModel: RichInputModel) {
    this.richInputModel = richInputModel;
    this.markPlugin = this.richInputModel.plugins.get('mark') as MarkPlugin;
  }

  transactionHook(transaction: Transaction) {
    const convertToMark = this.richInputModel.config.marks.filter((markConfig) => {
      return this.canConvertToTheMark(transaction, markConfig.wrapSymbol);
    })[0];

    if (!convertToMark) {
      return false;
    }

    const leftNode = this.richInputModel.richInputEditor.view.state.selection.$from.nodeBefore;
    const cursorPosition = this.richInputModel.richInputEditor.view.state.selection.$from.pos;
    const leftOpenCharacterIndex = leftNode.text.indexOf(convertToMark.wrapSymbol);
    const startPos = cursorPosition - leftNode.nodeSize + leftOpenCharacterIndex;

    const tr = this.richInputModel.richInputEditor.view.state.tr;
    tr.delete(startPos, startPos + 1);
    this.richInputModel.richInputEditor.view.dispatch(tr);

    // create mark
    this.markPlugin.createMark(convertToMark.name, startPos, tr.selection.$cursor.pos);

    // cancel current transaction
    return true;
  }

  private canConvertToTheMark(transaction: Transaction, symbol: string) {
    return this.doesReplaceStepModifyOneTextNode(transaction) &&
      this.isAddSymbol(transaction, symbol) &&
      !this.doesBeforeNodeHaveMarks() &&
      this.doesBeforeNodeHaveSymbol(symbol) &&
      this.distanceToSymbolForBeforeNode(symbol);
  }

  private distanceToSymbolForBeforeNode(symbol: string): number {
    const leftNode = this.richInputModel.richInputEditor.view.state.selection.$from.nodeBefore;
    const cursorPosition = this.richInputModel.richInputEditor.view.state.selection.$from.pos;
    const leftOpenCharacterIndex = leftNode.text.indexOf(symbol);
    const startPos = cursorPosition - leftNode.nodeSize + leftOpenCharacterIndex;

    return cursorPosition - startPos + 1;
  }

  private doesBeforeNodeHaveSymbol(symbol: string) {
    const leftNode = this.richInputModel.richInputEditor.view.state.selection.$from.nodeBefore;

    if (!leftNode) {
      return false;
    }

    const leftOpenCharacterIndex = leftNode.text.indexOf(symbol);

    return leftNode.nodeSize && leftOpenCharacterIndex !== -1;
  }

  private doesBeforeNodeHaveMarks() {
    const leftNode = this.richInputModel.richInputEditor.view.state.selection.$from.nodeBefore;

    return leftNode && leftNode.marks.length;
  }

  /**
   * Check whether transaction has only ReplaceStep which modifies one text node.
   */
  private doesReplaceStepModifyOneTextNode(transaction: Transaction) {
    if (transaction.steps.length !== 1) {
      return false;
    }

    const step = transaction.steps[0];

    if (!(step instanceof ReplaceStep)) {
      return false;
    }

    //
    return step.slice.content.childCount === 1;
  }

  private isAddSymbol(transaction: Transaction, symbol: string): boolean {
    const step = transaction.steps[0];

    const {text} = step.slice.content.firstChild;

    return text && text[text.length - 1] === symbol;
  }
}

/**
 * Knows when to show menu with all registered marks.
 * Listen for selected mark.
 */
class MarksMenuPlugin implements IPlugin {
  name = 'marks-menu';

  keymap = {
    'Ctrl-k': () => {
      // this.showMenu();
      // listen which item will be chosen
      // call other plugin method to add selected mark
    }
  };

  // indicates whether menu is show or not
  private menu: StickyModalRef;

  // stream of prosemirror transactions
  private transactions$: Subject<Transaction> = new Subject();

  private destroyed$ = new Subject();

  // stream of transactions where there are no selected text
  private noSelectedTextTr$ = this.transactions$.pipe(
    filter((transaction) => {
      return transaction.curSelection.empty;
    }),
    takeUntil(this.destroyed$)
  );

  // stream of transactions where there are selected text
  private textSelectedTr$ = this.transactions$.pipe(
    debounceTime(1000),
    filter((transaction) => {
      return !transaction.curSelection.empty;
    }),
    takeUntil(this.destroyed$)
  );

  private richInputModel: RichInputModel;

  onInitialize(richInputModel: RichInputModel) {
    this.richInputModel = richInputModel;

    this.textSelectedTr$.subscribe(() => {
      this.showMenu();
    });

    this.noSelectedTextTr$.subscribe(() => {
      this.hideMenu();
    });
  }

  transactionHook(transaction: Transaction) {
    this.transactions$.next(transaction);

    return false;
  }

  onDestroy() {
    this.destroyed$.next(true);
  }

  private showMenu() {
    if (this.menu) {
      return false;
    }

    const markPlugin = (this.richInputModel.plugins.get('mark') as MarkPlugin);
    const modalPlugin = (this.richInputModel.plugins.get('modal') as ModalPlugin);

    const {from, to} = this.richInputModel.richInputEditor.view.state.selection;

    const config = {
      marks: this.richInputModel.config.marks.map((mark) => {
        return {
          title: mark.name,
          click: (markConfig: any) => {
            console.log(`hideMenu`);
            this.hideMenu();
            markPlugin.createMark(markConfig.title, from, to);
            this.richInputModel.richInputEditor.focus();
          }
        };
      })
    };

    this.menu = modalPlugin.show(SelectionTextContextMenuComponent, config);
  }

  private hideMenu() {
    if (!this.menu) {
      return false;
    }

    this.menu.close();
    this.menu = null;
  }
}

/**
 * Sharable functionality for showing the component inside the modal.
 */
class ModalPlugin {
  name = 'modal';

  constructor(private container: HTMLElement,
              private ngxStickyModalService: StickyModalService,
              private componentFactoryResolver: ComponentFactoryResolver) {
  }

  show(component: any, data: any = {}) {
    return this.ngxStickyModalService.open({
      component: component,
      data,
      positionStrategy: {
        name: StickyPositionStrategy.flexibleConnected,
        options: {
          relativeTo: this.container
        }
      },
      position: {
        originX: 'start',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'top'
      },
      overlayConfig: {
        hasBackdrop: true
      },
      componentFactoryResolver: this.componentFactoryResolver
    });
  }
}

/**
 * Contains core state, provides low level API and defines overall data flow.
 */
class RichInputEditor {
  view: EditorView;

  constructor(private options: any) {
    console.log(this.options.marks);

    const customSchema = new Schema({
      nodes,
      marks: {
        ...marks,

        // register user custom marks
        ...this.options.marks
      },
    });

    const serializer = DOMSerializer.fromSchema(customSchema);

    const domNode = document.createElement('div');
    domNode.innerHTML = 'Some initial text';

    const state = EditorState.create({
      doc: DOMParser.fromSchema(customSchema).parse(domNode),
      schema: customSchema,
      plugins: [
        history(),
        keymap(options.keymap || {}),
        keymap(baseKeymap),
      ]
    });

    this.view = new EditorView(this.options.container, {
      state,
      dispatchTransaction: (transaction) => {
        const isTransactionCancelled = this.options.transactionHook.some((transactionHook) => {
          return transactionHook(transaction);
        });

        if (isTransactionCancelled) {
          console.log(`plugin cancel transaction`);
          return;
        }

        console.log(`transaction applied`);
        const newState = this.view.state.apply(transaction);
        this.view.updateState(newState);
      }
    });
  }

  focus() {
    this.view.focus();
  }

  createMark(markName: string, from: number, to: number, attrs: any = {}) {
    const tr = this.view.state.tr;
    const mark = this.view.state.doc.type.schema.marks[markName].create(attrs);
    tr.addMark(from, to, mark);

    this.view.dispatch(tr);
  }

  clearTextSelection() {
    let tr = this.view.state.tr;
    tr = tr.setSelection(new TextSelection(this.view.state.selection.$head));

    this.view.dispatch(tr);
  }
}

@Component({
  selector: 'rich-input',
  template: `
      <div #container></div>
      <button (click)="openSelectedTextMenu()">Open menu</button>
  `,
  styles: []
})
export class RichInputComponent implements OnInit, OnDestroy {
  @ViewChild('container') container: ElementRef;

  @Input() config: IRichInputConfig;

  private view: EditorView;
  private dispatchTransaction$ = new Subject<Transaction>();
  private richInputModel: RichInputModel;

  constructor(private ngxStickyModalService: StickyModalService,
              private componentFactoryResolver: ComponentFactoryResolver) {
  }

  ngOnInit() {
    this.richInputModel = new RichInputModel(
      this.container.nativeElement,
      this.config,
      this.ngxStickyModalService,
      this.componentFactoryResolver
    );

    /*const customSchema = new Schema({
      nodes,
      marks: {
        ...marks,
        ...this.config.marks.reduce((result, markConfig) => {
          result[markConfig.name] = {
            inclusive: false,
            parseDOM: [{tag: markConfig.tag}],
            toDOM: function toDOM() {
              return [markConfig.tag, 0];
            }
          };

          return result;
        }, {})
      },
    });

    const serializer = DOMSerializer.fromSchema(customSchema);

    const domNode = document.createElement('div');
    domNode.innerHTML = 'Some initial text';

    const customKeyMapConfig = this.config.marks.filter((markConfig) => {
      return markConfig.hotKey;
    }).reduce((result, markConfig) => {
      result[markConfig.hotKey] = (state, dispatch) => {
        const tr = this.view.state.tr;
        const {from, to} = state.selection;

        const mark = state.doc.type.schema.marks[markConfig.name].create();
        tr.addMark(from, to, mark);

        dispatch(tr);

        return true;
      };

      return result;
    }, {});

    const state = EditorState.create({
      doc: DOMParser.fromSchema(customSchema).parse(domNode),
      schema: customSchema,
      plugins: [
        keymap(customKeyMapConfig),
        keymap(baseKeymap),
      ]
    });

    this.view = new EditorView(this.container.nativeElement, {
      state,
      dispatchTransaction: (transaction) => {
        if (this.convertToMark(transaction)) {
          return;
        }

        this.dispatchTransaction$.next(transaction);
        const newState = this.view.state.apply(transaction);
        this.view.updateState(newState);
      }
    });

    this.dispatchTransaction$.pipe(
      filter((transaction) => {
        return !transaction.curSelection.empty;
      }),
      debounceTime(500)
    ).subscribe(() => {
      console.log(`selected`);
    });*/
  }

  ngOnDestroy() {
    this.richInputModel.onDestroy();
  }

  convertToMark(transaction) {
    const convertToMark = this.config.marks.filter((markConfig) => {
      return this.canConvertToTheMark(transaction, markConfig.wrapSymbol);
    })[0];

    if (!convertToMark) {
      return false;
    }

    const leftNode = this.view.state.selection.$from.nodeBefore;
    const cursorPosition = this.view.state.selection.$from.pos;
    const leftOpenCharacterIndex = leftNode.text.indexOf(convertToMark.wrapSymbol);
    const startPos = cursorPosition - leftNode.nodeSize + leftOpenCharacterIndex;

    const tr = this.view.state.tr;
    tr.delete(startPos, startPos + 1);

    const mark = this.view.state.doc.type.schema.marks[convertToMark.name].create();
    tr.addMark(startPos, tr.selection.$cursor.pos, mark);

    this.view.dispatch(tr);

    return true;
  }

  openSelectedTextMenu() {
    this.ngxStickyModalService.open({
      component: SelectionTextContextMenuComponent,
      positionStrategy: {
        name: StickyPositionStrategy.flexibleConnected,
        options: {
          relativeTo: this.container.nativeElement
        }
      },
      position: {
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'top'
      },
      overlayConfig: {
        hasBackdrop: true
      },
      componentFactoryResolver: this.componentFactoryResolver
    });
  }

  private canConvertToTheMark(transaction: Transaction, symbol: string) {
    return this.doesReplaceStepModifyOneTextNode(transaction) &&
      this.isAddSymbol(transaction, symbol) &&
      !this.doesBeforeNodeHaveMarks() &&
      this.doesBeforeNodeHaveSymbol(symbol) &&
      this.distanceToSymbolForBeforeNode(symbol);
  }

  private distanceToSymbolForBeforeNode(symbol: string): number {
    const leftNode = this.view.state.selection.$from.nodeBefore;
    const cursorPosition = this.view.state.selection.$from.pos;
    const leftOpenCharacterIndex = leftNode.text.indexOf(symbol);
    const startPos = cursorPosition - leftNode.nodeSize + leftOpenCharacterIndex;

    return cursorPosition - startPos + 1;
  }

  private doesBeforeNodeHaveSymbol(symbol: string) {
    const leftNode = this.view.state.selection.$from.nodeBefore;

    if (!leftNode) {
      return false;
    }

    const leftOpenCharacterIndex = leftNode.text.indexOf(symbol);

    return leftNode.nodeSize && leftOpenCharacterIndex !== -1;
  }

  private doesBeforeNodeHaveMarks() {
    const leftNode = this.view.state.selection.$from.nodeBefore;

    return leftNode && leftNode.marks.length;
  }

  /**
   * Check whether transaction has only ReplaceStep which modifies one text node.
   */
  private doesReplaceStepModifyOneTextNode(transaction: Transaction) {
    if (transaction.steps.length !== 1) {
      return false;
    }

    const step = transaction.steps[0];

    if (!(step instanceof ReplaceStep)) {
      return false;
    }

    //
    return step.slice.content.childCount === 1;
  }

  private isAddSymbol(transaction: Transaction, symbol: string): boolean {
    const step = transaction.steps[0];

    const {text} = step.slice.content.firstChild;

    return text && text[text.length - 1] === symbol;
  }
}
