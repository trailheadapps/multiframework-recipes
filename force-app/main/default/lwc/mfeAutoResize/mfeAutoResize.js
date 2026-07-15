import { LightningElement, api } from 'lwc';

export default class MfeAutoResize extends LightningElement {
    @api baseUrl = 'http://localhost:4300';
    debug = true;

    get computedSrc() {
        const url = new URL(this.baseUrl);
        url.pathname = '/auto-resize';
        return url.toString();
    }
}
