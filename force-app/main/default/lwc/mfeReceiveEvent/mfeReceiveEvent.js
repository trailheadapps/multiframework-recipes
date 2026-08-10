import { LightningElement, api, track } from 'lwc';

export default class MfeReceiveEvent extends LightningElement {
    @api baseUrl = 'http://localhost:5173';
    debug = false;

    @track sentCount = 0;
    @track lastSentAt = '';

    get computedSrc() {
        const url = new URL(this.baseUrl);
        url.pathname = '/embedding/receive-event';
        return url.toString();
    }

    handleNotify() {
        // Host → guest: dispatch a CustomEvent on <lightning-ui-embedding>. The
        // component forwards it over the wire (ui/events/dispatch) and the guest
        // hears it through viewSDK.addEventListener('host-notify', ...). Events
        // are only forwarded while the guest has a listener attached.
        const embedding = this.refs?.embedding;
        if (!embedding) return;
        this.sentCount += 1;
        this.lastSentAt = new Date().toLocaleTimeString();
        embedding.dispatchEvent(
            new CustomEvent('host-notify', {
                detail: { message: `Ping #${this.sentCount} from Salesforce` },
            }),
        );
    }
}
