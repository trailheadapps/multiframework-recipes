import { LightningElement, api, track } from 'lwc';

export default class MfeReceiveData extends LightningElement {
    @api baseUrl = 'http://localhost:4300';
    @track inputValue = 'Hello from Salesforce';
    @track committedSrc;
    debug = false;

    handleInputChange(evt) {
        this.inputValue = evt.target.value;
    }

    handleSend() {
        // <lightning-embedding>'s `src` is session-binding (read at mount; cannot
        // be mutated). Re-render the element with a new src that carries the
        // value as a query parameter; the MFE reads it via URLSearchParams.
        const url = new URL(this.baseUrl);
        url.pathname = '/receive-data';
        url.searchParams.set('message', this.inputValue);
        url.searchParams.set('timestamp', String(Date.now()));

        // Force remount: clear, then set on the next microtask.
        this.committedSrc = undefined;
        Promise.resolve().then(() => {
            this.committedSrc = url.toString();
        });
    }
}
