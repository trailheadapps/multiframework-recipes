import { LightningElement, api, track } from 'lwc';
import 'c/vendorLwcShell';

export default class MfeReceiveData extends LightningElement {
    @api baseUrl = 'http://localhost:4300';
    @track inputValue = 'Hello from Salesforce';
    _shellElement;

    get computedSrc() {
        const url = new URL(this.baseUrl);
        url.pathname = '/receive-data';
        return url.toString();
    }

    renderedCallback() {
        this._initializeShell();
    }

    disconnectedCallback() {
        this._shellElement = null;
    }

    handleInputChange(evt) {
        this.inputValue = evt.target.value;
    }

    handleSend() {
        if (!this._shellElement) {
            return;
        }
        // updateData() sends a postMessage into the MFE iframe.
        // The MFE receives it via bridge.addEventListener('data', handler).
        this._shellElement.updateData({ message: this.inputValue, timestamp: Date.now() });
    }

    _initializeShell() {
        if (this._shellElement) {
            return;
        }
        const container = this.template.querySelector('.shell-container');
        if (!container) {
            return;
        }
        const shell = document.createElement('lwc-shell');
        shell.sandbox = 'allow-forms allow-modals';
        shell.title = 'MFE Receive Data';
        shell.src = this.computedSrc;
        shell.addEventListener('widget-ready', () => {
            this._shellElement.updateData({ message: this.inputValue, timestamp: Date.now() });
        });
        container.appendChild(shell);
        this._shellElement = shell;
    }
}
