import {DOCUMENT} from '@angular/common';
import {
    ApplicationRef,
    ComponentFactoryResolver,
    ComponentRef,
    Directive,
    ElementRef,
    EmbeddedViewRef,
    HostListener,
    Inject,
    Injector,
    Input,
    NgZone,
    OnDestroy,
    OnInit
} from '@angular/core';
import {PickOutCoordinator} from '../pick-out-coordinator.service';
import {MOUSE_LEFT_KEY_CODE} from '../pick-out.constant';
import {IPickOutAreaConfig} from './pick-out-area-config.interface';
import {PickOutAreaComponent} from './pick-out-area.component';
import {PickOutAreaModel} from './pick-out-area.model';

@Directive({
    selector: '[pick-out-area]'
})
export class PickOutAreaDirective implements OnInit, OnDestroy {
    @Input('pick-out-area') config: IPickOutAreaConfig;

    doc: any = null;

    pickOutAreaModel: PickOutAreaModel = null;

    selectionRangeComponentRef: ComponentRef<PickOutAreaComponent> = null;

    onMouseUpBound: () => any;
    onMouseMoveBound: (event: MouseEvent) => void;
    onSelectionStartBound: () => any;
    onContainerScrollBound: () => any;

    previousClientX: number;
    previousClientY: number;

    constructor(@Inject(DOCUMENT) doc,
                private pickOutCoordinator: PickOutCoordinator,
                private componentFactoryResolver: ComponentFactoryResolver,
                private appRef: ApplicationRef,
                private zone: NgZone,
                private el: ElementRef,
                private injector: Injector) {
        this.doc = doc;
    }

    ngOnInit() {
        this.onMouseUpBound = this.onMouseUp.bind(this);
        this.onMouseMoveBound = this.onMouseMove.bind(this);
        this.onSelectionStartBound = this.onSelectionStart.bind(this);
        this.onContainerScrollBound = this.onContainerScroll.bind(this);

        this.doc.addEventListener('mousemove', this.onMouseMoveBound);
        this.doc.addEventListener('mouseup', this.onMouseUpBound);
        this.doc.addEventListener('selectstart', this.onSelectionStartBound);
        this.config.scrollableContainer.addEventListener('scroll', this.onContainerScrollBound);
    }

    triggerPickOutChanged() {
        this.pickOutCoordinator.pickOutChanged({
            x: this.pickOutAreaModel.clientX,
            y: this.pickOutAreaModel.clientY,
            width: this.pickOutAreaModel.width,
            height: this.pickOutAreaModel.height
        });
    }

    @HostListener('mousedown', ['$event'])
    mouseDown(event: MouseEvent) {
        if (event.button === MOUSE_LEFT_KEY_CODE && !this.isMouseOverDraggableElement(event.clientX, event.clientY)) {
            const scrollContextRect = this.config.scrollableContainer.getBoundingClientRect();
            const pageX = event.clientX - scrollContextRect.left;
            const pageY = event.clientY - scrollContextRect.top + this.config.scrollableContainer.scrollTop;

            const brickIdOverMouse = this.findBrickIdByCoordinate(event.clientX, event.clientY);

            this.pickOutAreaModel = new PickOutAreaModel(
                this.config.scrollableContainer,
                pageX,
                pageY,
                brickIdOverMouse
            );
        }
    }

    onMouseMove(event: any) {
        if (this.pickOutAreaModel) {
            this.pickOutAreaModel.updateCurrentClientPosition(event.clientX, event.clientY);
            this.pickOutAreaModel.updateCurrentBrickId(this.findBrickIdByCoordinate(event.clientX, event.clientY));

            if (this.pickOutAreaModel.isPickOutProcessInitialized) {
                event.preventDefault();

                this.triggerPickOutChanged();
            } else if (this.pickOutAreaModel.canInitiatePickOutProcess()) {
                this.pickOutAreaModel.initiatePickOutProcess();

                this.onStartPicKOut();
            }
        }
    }

    onMouseUp() {
        this.onStopPickOut();
    }

    onContainerScroll() {
        if (this.pickOutAreaModel && this.pickOutAreaModel.isPickOutProcessInitialized) {
            this.pickOutAreaModel.recalculatePositionAndSize();

            this.triggerPickOutChanged();
        }
    }

    onSelectionStart(e) {
        // does not allow select text during pick out process
        if (this.pickOutAreaModel && this.pickOutAreaModel.isPickOutProcessInitialized) {
            e.preventDefault();
        }
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

        this.config.scrollableContainer.appendChild(domElem);
    }

    removeRangeComponent() {
        this.appRef.detachView(this.selectionRangeComponentRef.hostView);
        this.selectionRangeComponentRef.destroy();
        this.selectionRangeComponentRef = null;
    }

    onStartPicKOut() {
        this.pickOutCoordinator.startPickOut();

        this.doc.activeElement.blur();

        this.renderRangeComponent();

        this.clearSelection();
    }

    onStopPickOut() {
        if (this.pickOutAreaModel && this.pickOutAreaModel.isPickOutProcessInitialized) {
            this.removeRangeComponent();

            this.pickOutCoordinator.endPickOut();
        }

        this.pickOutAreaModel = null;
    }

    ngOnDestroy() {
        this.doc.removeEventListener('mouseup', this.onMouseUpBound);
        this.doc.removeEventListener('mousemove', this.onMouseMoveBound);
        this.doc.removeEventListener('selectstart', this.onSelectionStartBound);
        this.config.scrollableContainer.removeEventListener('scroll', this.onContainerScrollBound);
    }

    private clearSelection() {
        window.getSelection().empty();
    }

    private findBrickIdByCoordinate(pageX: number, clientY: number): string {
        let currentElement = document.elementFromPoint(pageX, clientY);

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

    private isMouseOverDraggableElement(clientX: number, clientY: number): boolean {
        let currentElement = document.elementFromPoint(clientX, clientY);

        while (currentElement &&
        !(currentElement as HTMLElement).draggable &&
        !currentElement.classList.contains('wall-canvas-brick__draggable-box')) {
            currentElement = currentElement.parentElement;
        }

        return Boolean(currentElement);
    }
}
