import {Component, ComponentFactoryResolver, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';
import {IBaseTextState} from '../base-text-brick/base-text-state.interface';
import {IOnWallStateChange} from '../../wall/components/wall/interfaces/wall-component/on-wall-state-change.interface';
import {IOnWallFocus} from '../../wall/components/wall/interfaces/wall-component/on-wall-focus.interface';
import {IFocusContext} from '../../wall/components/wall/interfaces/wall-component/wall-component-focus-context.interface';
import {FOCUS_INITIATOR} from '../base-text-brick/base-text-brick.constant';
import {DOMParser, DOMSerializer, Schema} from 'prosemirror-model';
import {EditorView} from 'prosemirror-view';
import {StickyModalService} from 'ngx-sticky-modal';
import {EditorState, Plugin, PluginKey, Selection, TextSelection} from 'prosemirror-state';
import {setCursorAtTheStart} from 'ngx-rich-input';
import {filter, takeUntil, withLatestFrom} from 'rxjs/operators';
import {VIEW_MODE} from '../../wall/components/wall/wall-view.model';

const nodes = {
  doc: {
    // may contains 0 or multiple text nodes
    content: 'inline*'
  },
  text: {
    inline: true,
    group: 'inline',
  },
  star: {
    inline: true,
    group: 'inline',
    toDOM() {
      return ['star', '🟊'];
    },
    parseDOM: [{tag: 'star'}]
  },
};

const marks = {
  suggestion: {
    inclusive: true,
    parseDOM: [{tag: 'suggestion'}],
    toDOM() {
      return ['suggestion', 0];
    }
  },
  highlight: {
    inclusive: false,
    parseDOM: [{tag: 'highlight'}],
    toDOM() {
      return ['highlight', 0];
    }
  },
  em: {
    parseDOM: [
      {
        tag: 'i'
      }, {
        tag: 'em'
      }, {
        style: 'font-style=italic'
      }
    ],
    toDOM() {
      return ['em', 0];
    }
  },
  strong: {
    parseDOM: [
      {
        tag: 'b'
      }, {
        tag: 'strong'
      },
      {
        style: 'font-weight',
        getAttrs: value => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null
      }
    ],
    toDOM() {
      return ['b', 0];
    }
  },
  link: {
    inclusive: false, // Whether this mark should be active when the cursor is positioned at its ends
    attrs: {
      href: {},
      title: {default: null}
    },
    parseDOM: [{
      tag: 'a[href]', getAttrs(dom) {
        return {
          href: dom.getAttribute('href'),
          title: dom.getAttribute('title')
        };
      }
    }],
    toDOM(node) {
      const {href, title} = node.attrs;

      return ['a', {href, title}, 0];
    }
  }
};

const customSchema = new Schema({nodes, marks});

@Component({
  selector: 'text-brick2',
  templateUrl: './text-brick2.component.html',
  styleUrls: ['./text-brick2.component.scss']
})
export class TextBrick2Component implements OnInit, OnDestroy, IOnWallStateChange, IOnWallFocus {
  @ViewChild('container') editor: ElementRef;

  // take care of all subscriptions that should be destroyed after component will be destroyed
  private destroyed$ = new Subject();

  private textChange$: Subject<string> = new Subject();
  private view: any;

  constructor(private ngxStickyModalService: StickyModalService,
              private componentFactoryResolver: ComponentFactoryResolver) {
  }

  ngOnInit() {
    this.textChange$.pipe(
      takeUntil(this.destroyed$),
    ).subscribe(() => {
      // todo: continue here
      // this.setTextState(this.scope.text);
      // this.saveCurrentState();
    });

    const state = EditorState.create({
      schema: customSchema,
      plugins: []
    });


    this.view = new EditorView(this.editor.nativeElement, {
      state,
      dispatchTransaction: (transaction) => {
        if (transaction.docChanged) {
          console.log(`doc was changed`);
        }

        if (transaction.selectionSet) {
          console.log(`selection was explicitly updated by this transaction.`);
        }

        if (transaction.getMeta('pointer')) {
          console.log(`Transaction caused by mouse or touch input`);
        }

        const newState = this.view.state.apply(transaction);

        // The updateState method is just a shorthand to updating the "state" prop.
        this.view.updateState(newState);

        this.textChange.subscribe(() => {
          this.setTextState(this.scope.text);
          this.saveCurrentState();
        });

        console.log(transaction);
      },
    });
  }

  onWallStateChange(newState: IBaseTextState) {
    console.log(newState);
  }

  onWallFocus(context?: IFocusContext): void {
    if (this.editor.nativeElement === document.activeElement) {
      return;
    }

    console.log(context);
    this.editor.nativeElement.firstChild.focus();
    if (context) {

    } else {

      setCursorAtTheStart(this.view.state, this.view.dispatch);
    }
  }

  ngOnDestroy() {
    // destroy all component subscriptions
    this.destroyed$.next();
  }

  // HELPFUL FUNCTIONS

}
