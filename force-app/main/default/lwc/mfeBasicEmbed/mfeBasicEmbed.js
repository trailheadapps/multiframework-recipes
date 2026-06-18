import { LightningElement, api } from 'lwc';

export default class MfeBasicEmbed extends LightningElement {
    @api baseUrl = 'http://localhost:4300';
    debug = false;

    get computedSrc() {
        const url = new URL(this.baseUrl);
        url.pathname = '/basic-embed';
        return url.toString();
    }
}
