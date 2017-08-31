import {
    Component,
    ComponentFactoryResolver,
    EventEmitter,
    Injector,
    Input,
    OnChanges,
    OnInit,
    Output
} from '@angular/core';
import { WallApi } from '../wall/wall-api.service';

@Component({
    selector: 'wall-canvas',
    templateUrl: './wall-canvas-component.component.html',
    styleUrls: ['./wall-canvas.component.scss']
})
export class WallCanvasComponent implements OnInit, OnChanges {
    @Input() layout: any = {bricks: []};
    @Output() canvasClick: EventEmitter<any> = new EventEmitter();

    constructor(private wallApi: WallApi,
                private injector: Injector,
                private resolver: ComponentFactoryResolver) {
    }

    ngOnInit() {
        // this.render();
    }

    ngOnChanges() {
        console.log(this.layout)

        // this.render();
    }

    onCanvasClick() {
    }

    render() {
        /*this.container.clear();

        this.layout.bricks.forEach((raw) => {
            raw.columns.forEach((column) => {
                column.bricks.forEach((brick) => {
                    const factory = this.resolver.resolveComponentFactory(brick.component);

                    const componentReference = this.container.createComponent(factory, null, this.injector);

                    componentReference.instance['id'] = brick.id;
                });
            });
        });*/
    }
}