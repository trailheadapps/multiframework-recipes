import { LightningElement, api } from 'lwc';
import 'c/vendorLwcShell';

export default class MfeAutoResize extends LightningElement {
    @api baseUrl = 'http://localhost:4300';
    _shellElement;

    get computedSrc() {
        const url = new URL(this.baseUrl);
        url.pathname = '/auto-resize';
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
        shell.title = 'MFE Auto-Resize';
        shell.src = this.computedSrc;

        // No explicit resize handler needed — lwc-shell receives 'resize' events
        // from the bridge and updates iframe.style.height automatically.
        // Cancel the event here if you need a fixed height instead.
        shell.addEventListener('widget-ready', () => {
            // eslint-disable-next-line no-console
            console.log('[MfeAutoResize] widget-ready');
        });

        container.appendChild(shell);
        this._shellElement = shell;
    }
}
