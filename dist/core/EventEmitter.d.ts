type ValidCallbackArg = string | number | boolean | Date | object;
export type EventEmitterCallback = (...args: Array<any>) => void;
export interface IEvents {
    [key: string]: Array<EventEmitterCallback>;
}
export default class EventEmitter {
    events: IEvents;
    constructor(events?: IEvents);
    subscribe(name: string, cb: EventEmitterCallback): {
        unsubscribe: () => EventEmitterCallback[];
    };
    emit(name: string, ...args: Array<ValidCallbackArg>): void;
}
export {};
