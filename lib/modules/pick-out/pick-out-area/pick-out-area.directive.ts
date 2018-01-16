import { DOCUMENT } from '@angular/common';
import {
    ApplicationRef, ComponentFactoryResolver, ComponentRef, Directive, EmbeddedViewRef, HostListener, Inject,
    Injector, OnDestroy, OnInit
} from '@angular/core';
import { PickOutCoordinator } from '../pick-out-coordinator.service';
import { PickOutAreaComponent } from './pick-out-area.component';
import { PickOutAreaModel } from './pick-out-area.model';

@Directive({
    selector: '[pick-out-area]'
})
export class PickOutAreaDirective implements OnInit, OnDestroy {
    doc: any = null;

    pickOutAreaModel: PickOutAreaModel = null;

    selectionProcessStarted = false;

    selectionRangeComponentRef: ComponentRef<PickOutAreaComponent> = null;

    onMouseUpBound: any;    // todo add type
    onMouseMoveBound: any;
    onSelectionStartBound: any;

    constructor(@Inject(DOCUMENT) doc,
                private pickOutCoordinator: PickOutCoordinator,
                private componentFactoryResolver: ComponentFactoryResolver,
                private appRef: ApplicationRef,
                private injector: Injector) {
        this.doc = doc;
    }

    ngOnInit() {
        this.onMouseUpBound = this.onMouseUp.bind(this);
        this.onMouseMoveBound = this.onMouseMove.bind(this);
        this.onSelectionStartBound = this.onSelectionStart.bind(this);

        this.doc.addEventListener('mouseup', this.onMouseUpBound);
        this.doc.addEventListener('mousemove', this.onMouseMoveBound);
        this.doc.addEventListener('selectstart', this.onSelectionStartBound);
    }

    @HostListener('mousedown', ['$event'])
    mouseDown(event: MouseEvent) {
        const brickIdOverMouse = this.findBrickIdByCoordinate(event.clientX, event.clientY);

        if (!this.isMouseOverDraggableBox(event.clientX, event.clientY)) {
            this.pickOutAreaModel = new PickOutAreaModel(
                event.clientX,
                event.clientY,
                brickIdOverMouse
            );
        }
    }

    onSelectionStart(e) {
        if (this.selectionProcessStarted) {
            e.preventDefault();
        }
    }

    onMouseMove(event: MouseEvent) {
        if (this.pickOutAreaModel) {
            this.pickOutAreaModel.updateCurrentPosition(event.clientX, event.clientY);
            this.pickOutAreaModel.updateCurrentBrickId(this.findBrickIdByCoordinate(event.clientX, event.clientY));

            if (this.selectionProcessStarted) {
                event.preventDefault();

                this.pickOutCoordinator.pickOutChanged({
                    x: this.pickOutAreaModel.x,
                    y: this.pickOutAreaModel.y + window.scrollY,
                    width: this.pickOutAreaModel.width,
                    height: this.pickOutAreaModel.height
                });
            } else {
                if (this.pickOutAreaModel.canInitiatePickOutProcess()) {
                    this.startPicKOut();
                }
            }
        }
    }

    onMouseUp() {
        this.stopPickOut();
    }

    renderRangeComponent() {
        // https://medium.com/@caroso1222/angular-pro-tip-how-to-dynamically-create-components-in-body-ba200cc289e6

        // 1. Create a component reference from the component
        this.selectionRangeComponentRef = this.componentFactoryResolver
            .resolveComponentFactory(PickOutAreaComponent)
            .create(this.injector);

        this.selectionRangeComponentRef.instance.initialize(this.pickOutAreaModel);

        // 2. Attach component to the appRef so that it's inside the ng component tree
        this.appRef.attachView(this.selectionRangeComponentRef.hostView);

        // 3. Get DOM element from component
        const domElem = (this.selectionRangeComponentRef.hostView as EmbeddedViewRef<any>)
            .rootNodes[0] as HTMLElement;

        // 4. Append DOM element to the body
        document.body.appendChild(domElem);
    }

    removeRangeComponent() {
        this.appRef.detachView(this.selectionRangeComponentRef.hostView);
        this.selectionRangeComponentRef.destroy();
        this.selectionRangeComponentRef = null;
    }

    startPicKOut() {
        this.selectionProcessStarted = true;

        this.pickOutCoordinator.startPickOut();

        this.doc.activeElement.blur();

        this.renderRangeComponent();

        this.clearSelection();
    }

    stopPickOut() {
        if (this.selectionProcessStarted) {
            this.selectionProcessStarted = false;

            this.removeRangeComponent();

            this.pickOutCoordinator.endPickOut();
        }

        this.pickOutAreaModel = null;
    }

    ngOnDestroy() {
        this.doc.removeEventListener('mouseup', this.onMouseUpBound);
        this.doc.removeEventListener('mousemove', this.onMouseMoveBound);
        this.doc.removeEventListener('selectstart', this.onSelectionStartBound);
    }

    private clearSelection() {
        window.getSelection().empty();
    }

    private findBrickIdByCoordinate(clientX: number, clientY: number): string {
        let currentElement = document.elementFromPoint(clientX, clientY);

        while (currentElement && currentElement.tagName !== 'WALL-CANVAS-BRICK') {
            currentElement = currentElement.parentElement;
        }

        if (currentElement) {
            // there is canvas bricks
            return currentElement
                .getElementsByClassName('wall-canvas-brick__wrapper')[0]
                .getAttribute('id');
        } else {
            return null;
        }
    }

    private isMouseOverDraggableBox(clientX: number, clientY: number): boolean {
        let currentElement = document.elementFromPoint(clientX, clientY);

        while (currentElement && !currentElement.classList.contains('wall-canvas-brick__draggable-box')) {
            currentElement = currentElement.parentElement;
        }

        return Boolean(currentElement);
    }
}
