import { LightningElement, api } from 'lwc';
import 'c/vendorLwcShell';

export default class MfeGraphQL extends LightningElement {
    @api baseUrl = 'http://localhost:4300';
    _shellElement;

    get computedSrc() {
        const url = new URL(this.baseUrl);
        url.pathname = '/graphql-bridge';
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
        // allow-same-origin intentionally omitted — the GraphQL bridge proxies
        // queries through the host so the MFE never needs direct same-origin access.
        shell.sandbox = 'allow-forms allow-modals';
        shell.title = 'MFE GraphQL Bridge';
        shell.src = this.computedSrc;

        shell.addEventListener('widget-bridge-error', (evt) => {
            // eslint-disable-next-line no-console
            console.error('[MfeGraphQL] bridge error', evt.detail);
        });

        shell.addEventListener('widget-ready', () => {
            // eslint-disable-next-line no-console
            console.log('[MfeGraphQL] widget-ready — GraphQL bridge active');
        });

        container.appendChild(shell);
        this._shellElement = shell;
    }
}
