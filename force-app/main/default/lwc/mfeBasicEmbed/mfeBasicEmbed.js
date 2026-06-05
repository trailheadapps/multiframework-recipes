import { LightningElement, api } from 'lwc';
import 'c/vendorLwcShell';

export default class MfeBasicEmbed extends LightningElement {
    @api baseUrl = 'http://localhost:4300';
    _shellElement;

    get computedSrc() {
        const url = new URL(this.baseUrl);
        url.pathname = '/basic-embed';
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
        shell.title = 'MFE Basic Embed';
        shell.src = this.computedSrc;
        shell.addEventListener('widget-ready', () => {
            // eslint-disable-next-line no-console
            console.log('[MfeBasicEmbed] widget-ready');
        });
        container.appendChild(shell);
        this._shellElement = shell;
    }
}
