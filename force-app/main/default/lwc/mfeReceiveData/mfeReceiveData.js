import { LightningElement, api, track } from 'lwc';

export default class MfeReceiveData extends LightningElement {
    @api baseUrl = 'http://localhost:5173';
    @track inputValue = 'Hello from Salesforce';
    @track payload = {};
    debug = true;

    get computedSrc() {
        const url = new URL(this.baseUrl);
        url.pathname = '/embedding/receive-data';
        return url.toString();
    }

    handleInputChange(evt) {
        this.inputValue = evt.target.value;
    }

    handleSend() {
        // `props` on <lightning-ui-embedding> is the canonical host → guest channel
        // (ui/notifications/ui-state). Each new object identity schedules a
        // ui-state-changed flush; the guest sees it as `state.props`.
        this.payload = {
            message: this.inputValue,
            timestamp: Date.now(),
        };
    }
}
