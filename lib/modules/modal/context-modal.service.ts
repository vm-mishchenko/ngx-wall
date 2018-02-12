import { ElementRef, Injectable, Input, Renderer2, RendererFactory2 } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap/modal/modal-ref';
import { ContextModalComponent } from './context-modal.component';
import { CONTEXT_MODAL } from './index';

export interface IContextModalOptions {
    component: any;
    componentData?: any;
    context: {
        coordinate?: {
            x: number,
            y: number,
            direction: number
        },

        relative?: {
            nativeElement: any,
            direction?: string
        }
    };
}

@Injectable()
export class ContextModalService {
    renderer: Renderer2;

    constructor(private modalService: NgbModal,
                rendererFactory: RendererFactory2) {
        this.renderer = rendererFactory.createRenderer(null, null);
    }

    open(options: IContextModalOptions): NgbModalRef {
        this.renderer.addClass(document.body, CONTEXT_MODAL.bodyClass);

        const contextModalInstance = this.modalService.open(ContextModalComponent, {
            windowClass: CONTEXT_MODAL.modalClass
        });

        const componentInstance = contextModalInstance.componentInstance as ContextModalComponent;

        contextModalInstance.result.then((result) => {
            this.renderer.removeClass(document.body, CONTEXT_MODAL.bodyClass);
        }, (reason) => {
            this.renderer.removeClass(document.body, CONTEXT_MODAL.bodyClass);
        });

        componentInstance.component = options.component;
        componentInstance.onWallInitialize();

        if (options.context.relative) {
            setTimeout(() => {
                let x;
                let y;

                const relativeContext = options.context.relative;

                options.context.relative.direction = relativeContext.direction ||
                    CONTEXT_MODAL.relative.direction.bottom;

                if (relativeContext.direction === CONTEXT_MODAL.relative.direction.bottom) {
                    const relativeElementPosition = relativeContext.nativeElement.getBoundingClientRect();
                    const contextComponentWidth = componentInstance.el.nativeElement.offsetWidth;
                    const contextComponentHeight = componentInstance.el.nativeElement.offsetHeight;

                    x = relativeElementPosition.x + (relativeElementPosition.width / 2) - (contextComponentWidth / 2);
                    y = relativeElementPosition.y + relativeElementPosition.height + 5;
                }

                componentInstance.updatePosition(x, y);
            }, 0);
        }

        return contextModalInstance;
    }
}
