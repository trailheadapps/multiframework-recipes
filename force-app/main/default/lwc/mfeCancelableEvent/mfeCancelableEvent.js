import { LightningElement, api, track } from 'lwc';

export default class MfeCancelableEvent extends LightningElement {
    @api baseUrl = 'http://localhost:5173';
    debug = false;

    @track lastDecision = '';
    @track lastCheckedAt = '';

    _handler;

    get computedSrc() {
        const url = new URL(this.baseUrl);
        url.pathname = '/embedding/cancelable-event';
        return url.toString();
    }

    renderedCallback() {
        if (this._handler) return;
        // The guest replies with `submit-decision` (contains no hyphen issue for
        // imperative listeners). Register on the embedding element — the event
        // bubbles + composes out of <lightning-ui-embedding>.
        const embedding = this.refs?.embedding;
        if (!embedding) return;
        this._handler = (evt) => this.handleDecision(evt);
        embedding.addEventListener('submit-decision', this._handler);
    }

    disconnectedCallback() {
        if (this._handler) {
            this.refs?.embedding?.removeEventListener('submit-decision', this._handler);
            this._handler = undefined;
        }
    }

    handleCheck() {
        // Host → guest: ask the guest to approve a submit. `cancelable: true` lets
        // the guest call preventDefault() locally, but that veto does NOT return
        // over the wire — the guest reports its decision via `submit-decision`.
        const embedding = this.refs?.embedding;
        if (!embedding) return;
        this.lastCheckedAt = new Date().toLocaleTimeString();
        this.lastDecision = 'waiting…';
        embedding.dispatchEvent(new CustomEvent('submit-check', { cancelable: true }));
    }

    handleDecision(evt) {
        const allowed = Boolean(evt.detail?.allowed);
        this.lastDecision = allowed ? 'allowed' : 'vetoed';
    }
}
