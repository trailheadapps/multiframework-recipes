import { LightningElement, api } from 'lwc';

export default class MfeDirtyState extends LightningElement {
    @api baseUrl = 'http://localhost:4300';
    debug = false;

    get computedSrc() {
        const url = new URL(this.baseUrl);
        url.pathname = '/dirty-state';
        return url.toString();
    }
}
