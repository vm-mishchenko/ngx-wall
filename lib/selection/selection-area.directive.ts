import {
    ApplicationRef,
    ComponentFactoryResolver,
    ComponentRef,
    Directive,
    EmbeddedViewRef,
    EventEmitter,
    HostListener,
    Inject,
    Injector
} from '@angular/core';
import { SelectionRegister } from './selection-register.service';
import { SelectionRange } from './selection-range.component';
import { DOCUMENT } from '@angular/common';

export class RangeModelOnDestroy {
}

export class SelectionRangeModel {
    private changes: EventEmitter<any> = new EventEmitter();

    initialX: number;
    initialY: number;

    x: number;
    y: number;
    width: number;
    height: number;

    subscribe(fn: any) {
        return this.changes.subscribe(fn);
    }

    setInitialPosition(x: number, y: number) {
        this.initialX = x;
        this.initialY = y;

        this.x = x;
        this.y = y;
    }

    setCurrentPosition(x: number, y: number) {
        // update x position and width
        if (x < this.initialX) {
            this.width = this.initialX - x;

            this.x = x;
        } else {
            this.width = Math.abs(x - this.x);
        }

        // update y position and height
        if (y < this.initialY) {
            this.height = this.initialY - y;

            this.y = y;
        } else {
            this.height = Math.abs(y - this.y);
        }
    }

    onDestroy() {
        this.changes.next(new RangeModelOnDestroy());
    }
}

@Directive({
    selector: '[selection-area]'
})
export class SelectionAreaDirective {
    doc: any = null;

    selectionRangeModel: SelectionRangeModel = null;

    selectionRangeComponentRef: ComponentRef<SelectionRange> = null;

    @HostListener('mousedown', ['$event'])
    mouseDown(event: MouseEvent) {
        this.selectionRegister.startSelection();

        this.selectionRangeModel = new SelectionRangeModel();

        this.selectionRangeModel.setInitialPosition(event.clientX, event.clientY);
    }

    mouseMove(event: MouseEvent) {
        if (this.selectionRangeModel) {
            if (!this.selectionRangeComponentRef) {
                this.appendSelectionRangeComponent();
            }

            this.selectionRangeModel.setCurrentPosition(event.clientX, event.clientY);

            this.selectionRegister.selectionChanged({
                x: this.selectionRangeModel.x,
                y: this.selectionRangeModel.y,
                width: this.selectionRangeModel.width,
                height: this.selectionRangeModel.height
            });
        }
    }

    mouseUp() {
        if (this.selectionRangeModel) {
            this.selectionRangeModel.onDestroy();

            if (this.selectionRangeComponentRef) {
                this.removeSelectionRangeComponent();

                this.selectionRangeComponentRef = null;
            }

            this.selectionRangeModel = null;

            this.selectionRegister.endSelection();
        }
    }

    appendSelectionRangeComponent() {
        // https://medium.com/@caroso1222/angular-pro-tip-how-to-dynamically-create-components-in-body-ba200cc289e6

        // 1. Create a component reference from the component
        this.selectionRangeComponentRef = this.componentFactoryResolver
            .resolveComponentFactory(SelectionRange)
            .create(this.injector);

        this.selectionRangeComponentRef.instance.initialize(this.selectionRangeModel);

        // 2. Attach component to the appRef so that it's inside the ng component tree
        this.appRef.attachView(this.selectionRangeComponentRef.hostView);

        // 3. Get DOM element from component
        const domElem = (this.selectionRangeComponentRef.hostView as EmbeddedViewRef<any>)
            .rootNodes[0] as HTMLElement;

        // 4. Append DOM element to the body
        document.body.appendChild(domElem);
    }

    removeSelectionRangeComponent() {
        this.appRef.detachView(this.selectionRangeComponentRef.hostView);
        this.selectionRangeComponentRef.destroy();
    }

    constructor(@Inject(DOCUMENT) doc,
                private selectionRegister: SelectionRegister,
                private componentFactoryResolver: ComponentFactoryResolver,
                private appRef: ApplicationRef,
                private injector: Injector) {
        this.doc = doc;

        this.doc.addEventListener('mousemove', (e) => {
            this.mouseMove(e);
        });

        this.doc.addEventListener('mouseup', (e) => {
            this.mouseUp();
        });
    }
}