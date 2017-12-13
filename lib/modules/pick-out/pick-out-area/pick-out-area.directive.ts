import { DOCUMENT } from '@angular/common';
import {
    ApplicationRef, ComponentFactoryResolver, ComponentRef, Directive, EmbeddedViewRef, HostListener, Inject,
    Injector, OnDestroy
} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { StopPickOut } from '../';
import { PickOutCoordinator } from '../pick-out-coordinator.service';
import { windowToken } from '../pick-out.tokens';
import { PickOutAreaComponent } from './pick-out-area.component';
import { PickOutAreaModel } from './pick-out-area.model';

@Directive({
    selector: '[pick-out-area]'
})
export class PickOutAreaDirective implements OnDestroy {
    doc: any = null;

    window: any = null;

    currentYScrollPosition = 0;

    minimumMoveDistance = 5;

    pickOutAreaModel: PickOutAreaModel = null;

    selectionProcessStarted = false;

    selectionRangeComponentRef: ComponentRef<PickOutAreaComponent> = null;

    pickOutServiceSubscription: Subscription;

    constructor(@Inject(DOCUMENT) doc,
                @Inject(windowToken) private windowReference: any,
                private pickOutHandlerService: PickOutCoordinator,
                private componentFactoryResolver: ComponentFactoryResolver,
                private appRef: ApplicationRef,
                private injector: Injector) {
        this.doc = doc;
        this.window = this.windowReference;

        this.doc.addEventListener('mousemove', (e) => {
            this.mouseMove(e);
        });

        this.doc.addEventListener('mouseup', (e) => {
            this.mouseUp();
        });

        this.window.addEventListener('scroll', (e) => {
            this.currentYScrollPosition = this.window.scrollY;
        });

        this.pickOutServiceSubscription = this.pickOutHandlerService.changes.subscribe((e) => {
            if (e instanceof StopPickOut) {
                this.stopPickOut();
            }
        });
    }

    ngOnDestroy() {
        this.pickOutServiceSubscription.unsubscribe();
    }

    @HostListener('mousedown', ['$event'])
    mouseDown(event: MouseEvent) {
        if (this.isUserAllowPickOut()) {
            this.selectionProcessStarted = false;

            this.pickOutAreaModel = new PickOutAreaModel();

            this.pickOutAreaModel.setInitialPosition(event.clientX, event.clientY);
        }
    }

    mouseMove(event: MouseEvent) {
        if (this.isUserAllowPickOut()) {
            if (this.pickOutAreaModel) {
                this.pickOutAreaModel.setCurrentPosition(event.clientX, event.clientY);

                if (this.selectionProcessStarted) {
                    event.preventDefault();

                    this.pickOutHandlerService.pickOutChanged({
                        x: this.pickOutAreaModel.x,
                        y: this.pickOutAreaModel.y + this.currentYScrollPosition,
                        width: this.pickOutAreaModel.width,
                        height: this.pickOutAreaModel.height
                    });

                    // create UI selection if it's not exist
                    if (!this.selectionRangeComponentRef) {
                        this.appendSelectionRangeComponent();
                    }
                } else {
                    // user drags mouse enough to show UI and start selection process
                    if (this.isMouseMoveEnough()) {
                        this.pickOutHandlerService.startPickOut();

                        this.selectionProcessStarted = true;
                    }
                }
            }
        } else {
            this.stopPickOut();
        }
    }

    mouseUp() {
        this.stopPickOut();
    }

    appendSelectionRangeComponent() {
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

    removeSelectionRangeComponent() {
        this.appRef.detachView(this.selectionRangeComponentRef.hostView);
        this.selectionRangeComponentRef.destroy();
        this.selectionRangeComponentRef = null;
    }

    isMouseMoveEnough(): boolean {
        return this.pickOutAreaModel.width > this.minimumMoveDistance ||
            this.pickOutAreaModel.height > this.minimumMoveDistance;
    }

    isUserAllowPickOut() {
        return this.pickOutHandlerService.canPickOut();
    }

    stopPickOut() {
        if (this.selectionRangeComponentRef) {
            this.removeSelectionRangeComponent();
        }

        if (this.pickOutAreaModel) {
            this.pickOutAreaModel.onDestroy();

            this.pickOutHandlerService.endPickOut();
        }

        this.pickOutAreaModel = null;
    }
}
