import { LightningElement, api, track } from 'lwc';
import 'c/vendorLwcShell';

export default class MfeSendEvent extends LightningElement {
    @api baseUrl = 'http://localhost:4300';
    @track lastAction = '';
    _shellElement;

    get computedSrc() {
        const url = new URL(this.baseUrl);
        url.pathname = '/send-event';
        return url.toString();
    }

    renderedCallback() {
        this._initializeShell();
    }

    disconnectedCallback() {
        this._shellElement = null;
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
        shell.title = 'MFE Send Event';
        shell.src = this.computedSrc;

        // MFE dispatches bridge.dispatchEvent(new CustomEvent('mfe-action', { detail }))
        // lwc-shell re-dispatches it here as a DOM event on the shell element.
        shell.addEventListener('mfe-action', (evt) => {
            this.lastAction = `${evt.detail.action} at ${new Date(evt.detail.timestamp).toLocaleTimeString()}`;
        });

        shell.addEventListener('widget-ready', () => {
            // eslint-disable-next-line no-console
            console.log('[MfeSendEvent] widget-ready');
        });

        container.appendChild(shell);
        this._shellElement = shell;
    }
}
