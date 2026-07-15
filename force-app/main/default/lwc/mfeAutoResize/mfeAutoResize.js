import { LightningElement, api } from 'lwc';

export default class MfeAutoResize extends LightningElement {
    @api baseUrl = 'http://localhost:5173';
    debug = true;

    get computedSrc() {
        const url = new URL(this.baseUrl);
        url.pathname = '/embedding/auto-resize';
        return url.toString();
    }
}
