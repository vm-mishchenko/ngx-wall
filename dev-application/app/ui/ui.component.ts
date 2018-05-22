import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalExampleComponent } from './modal-example/modal-example.component';

@Component({
    selector: 'ui',
    templateUrl: './ui.component.html'
})
export class UiComponent implements OnInit {
    constructor(private modalService: NgbModal) {
    }

    ngOnInit() {
    }

    openModal() {
        this.modalService.open(ModalExampleComponent).result.then((result) => {
            console.log(`Closed with: ${result}`);
        }, (reason) => {
            console.log(`Closed with: ${reason}`);
        });
    }

    openDropdownLikeModal() {
        this.modalService.open(ModalExampleComponent, {
            windowClass: 'w-transparent-backdrop',
            backdrop: true
        }).result.then((result: any) => {
            console.log(`Closed with: ${result}`);
        }, (reason: any) => {
            console.log(`Closed with: ${reason}`);
        });
    }
}
