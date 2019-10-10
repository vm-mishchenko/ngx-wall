import {Component, ComponentFactoryResolver, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {StickyModalService, StickyPositionStrategy} from 'ngx-sticky-modal';
import {baseKeymap} from 'prosemirror-commands';
import {keymap} from 'prosemirror-keymap';
import {DOMParser, DOMSerializer, Schema} from 'prosemirror-model';

import {marks, nodes} from 'prosemirror-schema-basic';
import {EditorState} from 'prosemirror-state';
import {ReplaceStep} from 'prosemirror-transform';
import {EditorView} from 'prosemirror-view';
import {Observable, Subject} from 'rxjs';
import {SelectionMenuComponent} from './components/selection-menu/selection-menu.component';

export interface IMark {
  name: string;
  wrapSymbol: string;
  tag: string;
}

export interface IRichInputConfig {
  marks: IMark[];
}

@Component({
  selector: 'rich-input',
  template: `
      <div #container></div>
      <button (click)="openSelectedTextMenu()">Open menu</button>
  `,
  styles: []
})
export class RichInputComponent implements OnInit {
  @ViewChild('container') container: ElementRef;

  @Input() config: IRichInputConfig;

  textSelection$: Observable<boolean> = new Subject();

  private view: EditorView;

  constructor(private ngxStickyModalService: StickyModalService,
              private componentFactoryResolver: ComponentFactoryResolver) {
  }

  ngOnInit() {
    const customSchema = new Schema({
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
    domNode.innerHTML = '';

    const state = EditorState.create({
      doc: DOMParser.fromSchema(customSchema).parse(domNode),
      schema: customSchema,
      plugins: [
        keymap(baseKeymap)
      ]
    });

    this.view = new EditorView(this.container.nativeElement, {
      state,
      dispatchTransaction: (transaction) => {
        if (this.convertToMark(transaction)) {
          return;
        }

        if (!transaction.curSelection.empty) {
          // text selected
        }

        const newState = this.view.state.apply(transaction);

        this.view.updateState(newState);
      }
    });
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
      component: SelectionMenuComponent,
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

  private canConvertToTheMark(transaction, symbol: string) {
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
  private doesReplaceStepModifyOneTextNode(transaction) {
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

  private isAddSymbol(transaction, symbol): boolean {
    const step = transaction.steps[0];

    const {text} = step.slice.content.firstChild;

    return text && text[text.length - 1] === symbol;
  }
}
