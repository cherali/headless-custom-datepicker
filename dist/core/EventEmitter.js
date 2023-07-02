export default class EventEmitter {
    constructor(events) {
        this.events = events || {};
    }
    subscribe(name, cb) {
        (this.events[name] || (this.events[name] = [])).push(cb);
        return {
            unsubscribe: () => this.events[name] && this.events[name].splice(this.events[name].indexOf(cb) >>> 0, 1)
        };
    }
    emit(name, ...args) {
        (this.events[name] || []).forEach(fn => fn(...args));
    }
}
//# sourceMappingURL=EventEmitter.js.map