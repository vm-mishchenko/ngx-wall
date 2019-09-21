import {Transaction} from './wall-core.plugin2';

export class TransactionEvent {
    constructor(public transaction: Transaction) {
    }
}
