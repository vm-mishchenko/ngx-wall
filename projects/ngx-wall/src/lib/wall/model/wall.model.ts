import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import {WallCorePlugin2} from '../plugins/core2/wall-core.plugin2';
import {BrickRegistry} from '../registry/brick-registry.service';
import {WallPluginInitializedEvent} from './events/wall-plugin-initialized.event';
import {IWallModelConfig2} from './interfaces/wall-model-config.interface2';
import {IWallModel} from './interfaces/wall-model.interface';
import {IWallPlugin} from './interfaces/wall-plugin.interface';

interface IBrick2 {
    id: string;
}

type IPlan2 = IBrick2[];

// store data and method to modify it
class Plan {
    constructor(private bricks: any[] = []) {
    }

    add(id: string): Plan {
        // immutable
        return new Plan([]);
    }

    remove(): Plan {
        // immutable
        return new Plan([]);
    }
}

class Transaction {
    private plans: IPlan2[] = [];
    private changes = [];

    constructor(private planStorage: PlanStorage) {
    }

    get plan(): IPlan2 {
        const last = this.plans.length - 1;
        return last < 0 ? this.planStorage.query().plan : this.plans[last];
    }

    get change() {
        // sum up all changes
        return {};
    }

    apply() {
        this.planStorage.applyTransaction(this);
    }

    query() {
        return new PlanQuery(this.plan);
    }

    add() {
        const newId = String(Date.now());

        this.changes.push({
            added: newId
        });

        this.plans.push(
            [
                ...this.plan,
                {
                    id: newId
                }
            ]
        );

        return newId;
    }

    update(id: string, newState: any) {
        return this;
    }
}

class PlanQuery {
    constructor(readonly plan: IPlan2) {
    }

    lastId() {
        return '2';
    }
}

class PlanStorage {
    private events$: Subject<any> = new Subject<any>();
    private planState$: BehaviorSubject<IPlan2> = new BehaviorSubject([]);

    constructor() {
    }

    query() {
        return new PlanQuery(this.plan());
    }

    addBrick() {
        const transaction = model.transaction();

        const newId = transaction.add();
        transaction.update('1', {});
        transaction.apply();

        return newId;
    }

    transaction() {
        return new Transaction(this);
    }

    applyTransaction(transaction: Transaction) {
        this.planState$.next(transaction.plan);
        this.events$.next(transaction.change);
    }

    private plan() {
        return this.planState$.getValue();
    }
}

// client
const model = new PlanStorage();
model.addBrick();

const tr = model.transaction();
tr.add();
tr.update('1', {});
tr.apply();

// API VARIANTS

export class WallModel implements IWallModel {
    version: '0.0.0';

    // plugin api
    api: {
        [apiName: string]: any;
        // core: IWallCorePluginApi
        core: WallCorePlugin2
    } = {
        core: null
    };

    private events$: Observable<any> = new Subject();

    private plugins: Map<string, IWallPlugin> = new Map();

    constructor(private brickRegistry: BrickRegistry, config: IWallModelConfig2) {
        // initialize 3rd party plugins
        config.plugins.forEach((plugin) => this.initializePlugin(plugin));
    }

    // register external API
    registerApi(apiName: string, api: object) {
        this.api[apiName] = api;
    }

    destroy() {
        this.plugins.forEach((plugin) => this.destroyPlugin(plugin));
    }

    // proxy events from all plugins
    subscribe(callback): Subscription {
        return this.events$.subscribe(callback);
    }

    private dispatch(e: any): void {
        (this.events$ as Subject<any>).next(e);
    }

    private initializePlugin(plugin: IWallPlugin) {
        plugin.onWallInitialize(this);

        this.plugins.set(plugin.name, plugin);

        this.dispatch(new WallPluginInitializedEvent(plugin.name));
    }

    private destroyPlugin(plugin: IWallPlugin) {
        if (plugin.onWallPluginDestroy) {
            plugin.onWallPluginDestroy();
        }
    }
}
