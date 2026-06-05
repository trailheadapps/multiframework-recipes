import { LightningElement, api } from 'lwc';
import 'c/vendorLwcShell';

export default class MfeThemeTokens extends LightningElement {
    @api baseUrl = 'http://localhost:4300';
    _shellElement;

    get computedSrc() {
        const url = new URL(this.baseUrl);
        url.pathname = '/theme-tokens';
        return url.toString();
    }

    renderedCallback() {
        this._initializeShell();
    }

    disconnectedCallback() {
        this._shellElement = null;
    }

    handleRefreshTheme() {
        if (!this._shellElement) {
            return;
        }
        // Re-collects all CSS custom properties from the lwc-shell element
        // and pushes them to the MFE. Call this after the host page theme changes.
        this._shellElement.refreshTheme();
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
        shell.title = 'MFE Theme Tokens';
        shell.src = this.computedSrc;
        // Theme is sent automatically on connect. refreshTheme() re-syncs on demand.
        shell.addEventListener('widget-ready', () => {
            // eslint-disable-next-line no-console
            console.log('[MfeThemeTokens] widget-ready — theme sent automatically');
        });
        container.appendChild(shell);
        this._shellElement = shell;
    }
}
