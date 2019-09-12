import {ITransactionChanges} from './wall-core.plugin2';

export class TransactionEvent {
    constructor(public changes: ITransactionChanges) {
    }
}
