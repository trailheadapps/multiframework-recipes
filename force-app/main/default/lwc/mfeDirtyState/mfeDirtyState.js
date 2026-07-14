import { LightningElement, api, track } from 'lwc';

export default class MfeDirtyState extends LightningElement {
    @api baseUrl = 'http://localhost:4300';
    debug = false;

    @track hasSignal = false;
    @track isDirty = false;
    @track label = '';

    get computedSrc() {
        const url = new URL(this.baseUrl);
        url.pathname = '/dirty-state';
        return url.toString();
    }

    // Fires when <lightning-embedding> re-dispatches the wire event on the LWC.
    // The event bubbles + composes, so any ancestor of the embedding can listen.
    handleDirtyState(evt) {
        const { isDirty, label } = evt.detail ?? {};
        this.hasSignal = true;
        this.isDirty = Boolean(isDirty);
        this.label = typeof label === 'string' ? label : '';
    }
}
