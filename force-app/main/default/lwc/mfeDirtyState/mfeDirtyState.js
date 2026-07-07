import { LightningElement, api, track } from 'lwc';
import 'c/vendorLwcShell';

export default class MfeDirtyState extends LightningElement {
    @api baseUrl = 'http://localhost:4300';
    @track isDirty = false;
    @track dirtyLabel = '';
    _shellElement;
    _beforeUnloadHandler;

    get computedSrc() {
        const url = new URL(this.baseUrl);
        url.pathname = '/dirty-state';
        return url.toString();
    }

    get warningClass() {
        return this.isDirty
            ? 'slds-notify slds-notify_alert slds-theme_warning slds-m-bottom_small'
            : 'slds-hide';
    }

    renderedCallback() {
        this._initializeShell();
    }

    disconnectedCallback() {
        this._shellElement = null;
        this._detachBeforeUnload();
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
        shell.title = 'MFE Dirty State';
        shell.src = this.computedSrc;

        // trackdirtystate fires when the MFE calls
        // bridge.dispatchEvent(new CustomEvent('trackdirtystate', { detail: { isDirty, label } }))
        shell.addEventListener('trackdirtystate', (evt) => {
            const isDirty = !!evt.detail.isDirty;
            const label = evt.detail.label ?? 'Unsaved changes';
            this.isDirty = isDirty;
            this.dirtyLabel = label;

            // Re-dispatch from the LWC itself so Lightning Experience picks it
            // up and blocks navigation with its standard unsaved-changes dialog.
            this.dispatchEvent(
                new CustomEvent('trackdirtystate', {
                    detail: { isDirty, label },
                    bubbles: true,
                    composed: true,
                })
            );

            // Belt-and-suspenders: also warn on browser-level navigation
            // (tab close, reload, URL change). Works when the component is
            // hosted outside a Lightning context too.
            if (isDirty) {
                this._attachBeforeUnload();
            } else {
                this._detachBeforeUnload();
            }
        });

        shell.addEventListener('widget-ready', () => {
            // eslint-disable-next-line no-console
            console.log('[MfeDirtyState] widget-ready');
        });

        container.appendChild(shell);
        this._shellElement = shell;
    }

    _attachBeforeUnload() {
        if (this._beforeUnloadHandler) {
            return;
        }
        this._beforeUnloadHandler = (evt) => {
            evt.preventDefault();
            // Modern browsers ignore the custom string but require returnValue set.
            evt.returnValue = '';
        };
        window.addEventListener('beforeunload', this._beforeUnloadHandler);
    }

    _detachBeforeUnload() {
        if (!this._beforeUnloadHandler) {
            return;
        }
        window.removeEventListener('beforeunload', this._beforeUnloadHandler);
        this._beforeUnloadHandler = null;
    }
}
