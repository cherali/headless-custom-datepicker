type ValidCallbackArg = string | number | boolean | Date | object

export type EventEmitterCallback = (...args: Array<any>) => void

export interface IEvents {
  [key: string]: Array<EventEmitterCallback>;
}

export default class EventEmitter {
  public events: IEvents

  constructor(events?: IEvents) {
    this.events = events || {}
  }

  public subscribe(name: string, cb: EventEmitterCallback) {
    (this.events[name] || (this.events[name] = [])).push(cb)

    return {
      unsubscribe: () =>
        this.events[name] && this.events[name].splice(this.events[name].indexOf(cb) >>> 0, 1)
    }
  }

  public emit(name: string, ...args: Array<ValidCallbackArg>): void {
    (this.events[name] || []).forEach(fn => fn(...args))
  }
}