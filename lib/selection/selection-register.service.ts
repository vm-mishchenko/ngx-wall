import { Injectable } from '@angular/core';

@Injectable()
export class SelectionRegister {
    registerSelectionArea() {
        console.log('registerSelectionArea method');
    }

    registerSelectionItem() {
        console.log('registerSelectionItem method');
    }
}