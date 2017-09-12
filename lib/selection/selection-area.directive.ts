import {
    ApplicationRef,
    ComponentFactoryResolver,
    Directive,
    EmbeddedViewRef,
    HostListener,
    Injector
} from '@angular/core';
import { SelectionRegister } from './selection-register.service';
import { SelectionRange } from './selection-range.component';

@Directive({
    selector: '[selection-area]'
})
export class SelectionAreaDirective {
    rangeModel: any = null;

    @HostListener('mousedown', ['$event'])
    mouseDown(event: MouseEvent) {
        console.log(`mouseDown`);

        this.rangeModel = {
            mouseDown: {
                x: event.clientX,
                y: event.clientY
            },
            mouseMove: {
                x: null,
                y: null
            },
            mouseUp: {
                x: null,
                y: null
            }
        };
    }

    @HostListener('mousemove', ['$event'])
    mouseMove(event: MouseEvent) {
        console.log(`mouseMove`);

        if (this.rangeModel) {
            this.appendSelectionRangeComponent();

            this.rangeModel.mouseMove.x = event.clientX;
            this.rangeModel.mouseMove.y = event.clientY;
        }
    }

    @HostListener('mouseup', ['$event'])
    mouseUp(event: MouseEvent) {
        console.log(`mouseUp`);

        if (this.rangeModel) {
            this.rangeModel.mouseUp.x = event.clientX;
            this.rangeModel.mouseUp.y = event.clientY;
        }
    }

    @HostListener('click', ['$event'])
    click(event: Event) {


        // 5. Wait some time and remove it from the component tree and from the DOM
        /*setTimeout(() => {
            this.appRef.detachView(componentRef.hostView);
            componentRef.destroy();
        }, 3000);*/
    }

    appendSelectionRangeComponent() {
        // https://medium.com/@caroso1222/angular-pro-tip-how-to-dynamically-create-components-in-body-ba200cc289e6

        // 1. Create a component reference from the component
        const componentRef = this.componentFactoryResolver
            .resolveComponentFactory(SelectionRange)
            .create(this.injector);

        // 2. Attach component to the appRef so that it's inside the ng component tree
        this.appRef.attachView(componentRef.hostView);

        // 3. Get DOM element from component
        const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
            .rootNodes[0] as HTMLElement;

        // 4. Append DOM element to the body
        document.body.appendChild(domElem);
    }

    constructor(private selectionRegister: SelectionRegister,
                private componentFactoryResolver: ComponentFactoryResolver,
                private appRef: ApplicationRef,
                private injector: Injector) {

    }
}