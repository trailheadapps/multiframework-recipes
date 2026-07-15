import { LightningElement, api, track } from 'lwc';

export default class MfeSendEvent extends LightningElement {
    @api baseUrl = 'http://localhost:5173';
    debug = false;

    @track lastAction = '';
    @track lastReceivedAt = '';
    @track receivedCount = 0;

    _handler;

    get computedSrc() {
        const url = new URL(this.baseUrl);
        url.pathname = '/embedding/send-event';
        return url.toString();
    }

    renderedCallback() {
        if (this._handler) return;
        // 'mfe-action' contains a hyphen, which LWC's template `on<eventname>`
        // binding does not accept. Register imperatively instead — the event
        // bubbles + composes out of <lightning-embedding>, so any ancestor
        // element inside this template catches it.
        const host = this.refs?.host;
        if (!host) return;
        this._handler = (evt) => this.handleMfeAction(evt);
        host.addEventListener('mfe-action', this._handler);
    }

    disconnectedCallback() {
        if (this._handler) {
            this.refs?.host?.removeEventListener('mfe-action', this._handler);
            this._handler = undefined;
        }
    }

    handleMfeAction(evt) {
        const { action, timestamp } = evt.detail ?? {};
        this.lastAction = typeof action === 'string' ? action : '';
        this.lastReceivedAt = timestamp
            ? new Date(timestamp).toLocaleTimeString()
            : new Date().toLocaleTimeString();
        this.receivedCount += 1;
    }
}
