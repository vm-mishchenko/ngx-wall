import {DOCUMENT} from '@angular/common';
import {ComponentFactoryResolver, Directive, Inject, Input, NgZone, OnInit, ViewContainerRef} from '@angular/core';
import {ComponentRef} from '@angular/core/src/linker/component_factory';
import {ResizableHandlerComponent} from './resizable-handler.component';
import {LEFT_HANDLER_CLASS, RIGHT_HANDLER_CLASS} from './resizable.const';

export interface IResizeData {
    xInitial: number;
    xCurrent: number;

    offset: number;

    isLeftDirection: boolean;
    isRightDirection: boolean;
}

/**
 * @description
 * 1. dynamically add left and right handlers
 * 2. allow to show/hide handlers
 * 3. call callback, where to pass
 *  - distance on which handlers is moved
 *  - handler type (left of right)
 */
@Directive({
    selector: '[wResizable]'
})
export class ResizableDirective implements OnInit {
    @Input() wResizable: {
        resize: (resizeData: IResizeData) => void;
        resizeStart: (resizeData: IResizeData) => void;
        resizeEnd: (resizeData: IResizeData) => void;
    };

    private resizeData: IResizeData = null;

    constructor(private el: ViewContainerRef,
                private zone: NgZone,
                private cfr: ComponentFactoryResolver,
                @Inject(DOCUMENT) private doc) {
    }

    ngOnInit() {
        const leftHandler = this.createHandler(LEFT_HANDLER_CLASS);
        const rightHandler = this.createHandler(RIGHT_HANDLER_CLASS);

        leftHandler.instance.mouseDownEvent.subscribe((e: MouseEvent) => {
            this.mouseDownHandler(e, true);
        });

        rightHandler.instance.mouseDownEvent.subscribe((e: MouseEvent) => {
            this.mouseDownHandler(e, false);
        });

        this.doc.addEventListener('mousemove', (event: MouseEvent) => {
            if (this.resizeData) {
                this.resizeData.xCurrent = event.clientX;

                if (this.resizeData.isLeftDirection) {
                    this.resizeData.offset = this.resizeData.xInitial - this.resizeData.xCurrent;
                } else if (this.resizeData.isRightDirection) {
                    this.resizeData.offset = this.resizeData.xCurrent - this.resizeData.xInitial;
                }

                if (this.wResizable.resize) {
                    this.wResizable.resize(this.resizeData);
                }
            }
        });

        this.doc.addEventListener('mouseup', () => {
            if (this.wResizable.resizeEnd) {
                this.wResizable.resizeEnd(this.resizeData);
            }

            this.resizeData = null;
        });
    }

    private createHandler(customClassName: string): ComponentRef<ResizableHandlerComponent> {
        const handler = this.el.createComponent(
            this.cfr.resolveComponentFactory(ResizableHandlerComponent)
        );

        handler.instance.customClassName = customClassName;

        return handler;
    }

    private mouseDownHandler(e: MouseEvent, isLeftDirection: boolean) {
        e.preventDefault();
        e.stopPropagation();

        this.resizeData = {
            xInitial: e.clientX,
            xCurrent: e.clientX,
            offset: 0,
            isLeftDirection,
            isRightDirection: !isLeftDirection
        };

        if (this.wResizable.resizeStart) {
            this.wResizable.resizeStart(this.resizeData);
        }
    }
}
