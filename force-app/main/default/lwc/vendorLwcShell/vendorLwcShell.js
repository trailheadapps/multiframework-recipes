/* eslint-disable */
// Vendored from @salesforce/experimental-mfe-lwc-shell npm package
/*! @salesforce/experimental-mfe-lwc-shell v2.2.1-rc.8 (2026-06-18) */
/**
 * EmbeddingResizer - Handles dynamic iframe/container resizing
 * Uses ResizeObserver to monitor element size changes and notify the host
 */
/**
 * Generates a pseudo-random alphanumeric identifier string for unique
 * element IDs or temporary identifiers (not cryptographically secure).
 *
 * @returns Random alphanumeric string
 *
 * @example
 * getUUID(); // 'k2j8f5l9m'
 */
function getUUID() {
    return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(36);
}

/**
 * InternalHostLwcShell
 *
 * A standard Web Component (custom element) that embeds an iframe-based widget
 * with bridge communication, sandbox management, and fullscreen support.
 *
 * Registered as `<lwc-shell>`.
 *
 * Dirty-state tracking is handled via a simple `trackdirtystate`
 * custom-event flow: the embedded widget dispatches `trackdirtystate`
 * with `{ isDirty, instanceId, label }`, and this shell re-dispatches
 * the event for the host LWC to observe.
 *
 * **How customers use this:**
 * 1. The build produces `dist/index.esm.js` which bundles this class.
 * 2. Customers copy that file into their SFDX project as an LWC entity
 *    (e.g. `c/lwcShell`) and deploy it to their Salesforce org.
 * 3. A wrapper LWC imports `'c/lwcShell'` and creates `<lwc-shell>`
 *    imperatively via `document.createElement('lwc-shell')`.
 *
 * See the README and the `productRegistration` demo for a full recipe.
 */
const BASE_TOKENS = ["allow-scripts", "allow-pointer-lock"];
const OPTIONAL_TOKENS = ["allow-downloads", "allow-forms", "allow-modals"];
const BLOCKED_TOKENS = ["allow-same-origin", "allow-top-navigation", "allow-popups"];
const STATES = {
    LOADING: "state-loading",
    LOADED: "state-loaded",
};
const STYLES = /* css */ `
:host {
    display: block;
    position: relative;
    height: 100%;
    overflow: auto;
    box-sizing: border-box;
}

.container {
    width: 100%;
    height: 100%;
    position: relative;
}

.frame {
    visibility: hidden;
    display: block;
    width: 100%;
    height: 100%;
    border: none;
}

.container[data-state='state-loaded'] .frame {
    visibility: visible;
}

/* Fullscreen overlay */
.overlayBackdrop {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9998;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(4px);
}

.overlayClose {
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 9999;
    width: 32px;
    height: 32px;
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    border-radius: 50%;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
}

.frameFull {
    position: fixed;
    inset: 0;
    width: 90vw;
    height: 90vh !important;
    margin: 5vh 5vw;
    z-index: 10000;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}
`;
class InternalHostLwcShell extends HTMLElement {
    _shadow;
    _iframe = null;
    _container = null;
    _currentState = STATES.LOADING;
    _readinessTimeout = null;
    _isFullscreen = false;
    _preFullscreenHeight = "";
    _lastThemeData = {};
    _lastPayloadData = {};
    _bridgeReady = false;
    _shellInstanceId = getUUID();
    _hasSentTheme = false;
    _hasSentData = false;
    _src = null;
    _srcdoc = null;
    _sandbox = null;
    _title = "Embedded widget";
    _view = "compact";
    _debugEnabled = true;
    static get observedAttributes() {
        return ["src", "srcdoc", "sandbox", "title", "view", "debug"];
    }
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: "closed" });
    }
    connectedCallback() {
        this._renderInitial();
        this._setupMessageListener();
        this._log("connectedCallback");
    }
    disconnectedCallback() {
        window.removeEventListener("message", this._handleMessage);
        if (this._readinessTimeout) {
            clearTimeout(this._readinessTimeout);
            this._readinessTimeout = null;
        }
        this._log("disconnectedCallback");
    }
    attributeChangedCallback(name, oldVal, newVal) {
        if (oldVal === newVal)
            return;
        switch (name) {
            case "src":
                this.src = newVal;
                break;
            case "srcdoc":
                this.srcdoc = newVal;
                break;
            case "sandbox":
                this.sandbox = newVal;
                break;
            case "title":
                this.title = newVal;
                break;
            case "view":
                this.view = newVal;
                break;
            case "debug":
                this.debug = newVal !== null;
                break;
        }
    }
    get src() {
        return this._src;
    }
    set src(v) {
        const val = v || null;
        if (this._src === val)
            return;
        this._src = val;
        if (val !== null) {
            this.setAttribute("src", val);
        }
        else {
            this.removeAttribute("src");
        }
        this._updateIframeSrc();
    }
    get srcdoc() {
        return this._srcdoc;
    }
    set srcdoc(v) {
        const val = v || null;
        if (this._srcdoc === val)
            return;
        this._srcdoc = val;
        if (val !== null) {
            this.setAttribute("srcdoc", val);
        }
        else {
            this.removeAttribute("srcdoc");
        }
        this._updateIframeSrc();
    }
    get sandbox() {
        return this._sandbox;
    }
    set sandbox(v) {
        const val = v || null;
        if (this._sandbox === val)
            return;
        this._sandbox = val;
        if (val !== null) {
            this.setAttribute("sandbox", val);
        }
        else {
            this.removeAttribute("sandbox");
        }
        this._applySandbox();
    }
    get title() {
        return this._title;
    }
    set title(v) {
        const val = v || "Embedded widget";
        if (this._title === val)
            return;
        this._title = val;
        this.setAttribute("title", val);
        this._updateTitle();
    }
    get view() {
        return this._view;
    }
    set view(v) {
        const val = v === "full" ? "full" : "compact";
        if (this._view === val)
            return;
        this._view = val;
        this.setAttribute("view", val);
        this._updateViewDOM();
    }
    /**
     * Controls debug logging. Toggle via:
     * - HTML attribute: `<lwc-shell debug>`
     * - Programmatically: `shell.debug = true`
     */
    get debug() {
        return this._debugEnabled;
    }
    set debug(v) {
        const val = !!v;
        if (this._debugEnabled === val)
            return;
        this._debugEnabled = val;
        if (val) {
            this.setAttribute("debug", "");
        }
        else {
            this.removeAttribute("debug");
        }
    }
    updateData(newData) {
        if (!newData || typeof newData !== "object")
            return;
        Object.entries(newData).forEach(([key, value]) => {
            const dataAttr = `data-${String(key).replace(/[A-Z]/g, "-$&").toLowerCase()}`;
            this.setAttribute(dataAttr, String(value));
        });
        const payload = this._collectDataAttributes();
        this._lastPayloadData = payload;
        if (this._bridgeReady) {
            this._postToIframe("data", payload);
            this._hasSentData = true;
            this._log("send data", payload);
        }
        else {
            this._log("queue data until bridge ready", payload);
        }
    }
    refreshTheme() {
        this._sendInitialTheme();
    }
    get _isFullView() {
        return this._view === "full";
    }
    get _frameClass() {
        return this._isFullView ? "frame frameFull" : "frame";
    }
    _log(...args) {
        if (this._debugEnabled) {
            // eslint-disable-next-line no-console
            console.log("[InternalHostLwcShell]", JSON.stringify(args, null, 2));
        }
    }
    _renderInitial() {
        const shadow = this._shadow;
        shadow.innerHTML = `
            <style>${STYLES}</style>
            <div class="container" data-state="${this._currentState}">
                <iframe class="${this._frameClass}" title="${this._title}"></iframe>
            </div>
        `;
        this._container = shadow.querySelector(".container");
        this._iframe = shadow.querySelector("iframe");
        this._container.addEventListener("click", () => this._handleContainerClick());
        this._applySandbox();
        this._updateIframeSrc();
        this._sendInitialTheme();
        this._log("renderInitial: iframe ready");
    }
    _updateContainerState() {
        if (this._container) {
            this._container.setAttribute("data-state", this._currentState);
        }
    }
    _updateTitle() {
        if (this._iframe) {
            this._iframe.setAttribute("title", this._title);
        }
        this._log("title", this._title);
    }
    _updateViewDOM() {
        if (this._iframe) {
            this._iframe.className = this._frameClass;
        }
        if (!this._container)
            return;
        const existingBackdrop = this._container.querySelector(".overlayBackdrop");
        const existingClose = this._container.querySelector(".overlayClose");
        if (existingBackdrop)
            existingBackdrop.remove();
        if (existingClose)
            existingClose.remove();
        if (this._isFullView) {
            const backdrop = document.createElement("div");
            backdrop.className = "overlayBackdrop";
            backdrop.setAttribute("aria-hidden", "true");
            const closeBtn = document.createElement("button");
            closeBtn.className = "overlayClose";
            closeBtn.type = "button";
            closeBtn.setAttribute("aria-label", "Close fullscreen");
            closeBtn.textContent = "\u2715";
            closeBtn.addEventListener("click", this._exitFullscreen);
            this._container.appendChild(backdrop);
            this._container.appendChild(closeBtn);
        }
    }
    _setState(newState) {
        this._currentState = newState;
        this._updateContainerState();
        if (newState === STATES.LOADED) {
            this._sendInitialData();
        }
    }
    _setupMessageListener() {
        window.addEventListener("message", this._handleMessage);
    }
    _handleMessage = (event) => {
        const sourceWin = this._iframe?.contentWindow;
        if (event.source !== sourceWin) {
            return;
        }
        const payload = event.data || {};
        const { type, data, id } = payload;
        if (id ? id !== this._shellInstanceId : type !== "bridge-ready")
            return;
        this._log("receive", type, data);
        if (type === "bridge-event") {
            const { eventType, detail } = data || {};
            this._log("bridge-event", eventType, detail);
            if (eventType === "resize") {
                this._handleResize(detail);
            }
            else if (eventType === "widget-ready") {
                this._handleWidgetReady();
            }
            else {
                throw new RangeError(`Invalid bridge event ${eventType}`);
            }
        }
        else if (type === "custom-event") {
            const { eventType, detail } = data || {};
            this._log("custom-event", eventType, detail);
            if (eventType === "fullscreen-request") {
                const shouldRunDefault = this.dispatchEvent(new CustomEvent(eventType, {
                    detail,
                    bubbles: true,
                    cancelable: true,
                }));
                if (shouldRunDefault) {
                    this._handleFullscreenRequest();
                }
            }
            else {
                this.dispatchEvent(new CustomEvent(eventType, { detail, bubbles: true, cancelable: true, composed: true }));
            }
        }
        else if (type === "bridge-ready") {
            this._handleBridgeReady();
        }
        else if (type === "bridge-error") {
            this._handleBridgeError(data);
        }
    };
    _handleResize({ height }) {
        const evt = new CustomEvent("resize", {
            detail: { height },
            cancelable: true,
        });
        this.dispatchEvent(evt);
        if (!evt.defaultPrevented && !this._isFullscreen && typeof height === "number" && Number.isFinite(height)) {
            if (this._iframe)
                this._iframe.style.height = height + "px";
            this._log("applied resize", height);
        }
    }
    _handleWidgetReady() {
        if (this._readinessTimeout) {
            clearTimeout(this._readinessTimeout);
            this._readinessTimeout = null;
        }
        this.dispatchEvent(new CustomEvent("widget-ready", { bubbles: true }));
        this._log("widget-ready");
    }
    _handleFullscreenRequest() {
        if (!this._isFullscreen) {
            this._enterFullscreen();
        }
    }
    _enterFullscreen() {
        this._isFullscreen = true;
        this._preFullscreenHeight = this._iframe?.style.height ?? "";
        this._view = "full";
        this._updateViewDOM();
        if (this._iframe)
            this._iframe.style.height = "100%";
        this.updateData({ view: "full" });
        this.dispatchEvent(new CustomEvent("fullscreen-entered", {
            detail: { element: this },
            bubbles: true,
        }));
        this._log("enter fullscreen");
    }
    _exitFullscreen = () => {
        this._isFullscreen = false;
        this._view = "compact";
        this._updateViewDOM();
        if (this._iframe)
            this._iframe.style.height = this._preFullscreenHeight;
        this.updateData({ view: "compact" });
        this.dispatchEvent(new CustomEvent("fullscreen-exited", {
            detail: { element: this },
            bubbles: true,
        }));
        this._log("exit fullscreen");
    };
    _handleBridgeReady() {
        this._bridgeReady = true;
        this._postToIframe("shell-ready");
        this._setState(STATES.LOADED);
    }
    _handleBridgeError(errorData) {
        this.dispatchEvent(new CustomEvent("widget-bridge-error", { detail: errorData }));
        this._log("bridge-error", errorData);
    }
    _handleContainerClick() {
        // placeholder
    }
    _applySandbox() {
        const frame = this._iframe;
        if (!frame)
            return;
        const tokens = this._computeSandboxTokens();
        frame.setAttribute("sandbox", tokens);
        this._log("sandbox", tokens);
    }
    _computeSandboxTokens() {
        const tokens = [...BASE_TOKENS];
        if (this._sandbox) {
            const requested = String(this._sandbox).split(/\s+/).filter(Boolean);
            requested.forEach((t) => {
                if (OPTIONAL_TOKENS.includes(t) && !tokens.includes(t))
                    tokens.push(t);
                if (BLOCKED_TOKENS.includes(t)) {
                    this.dispatchEvent(new CustomEvent("security-violation", {
                        detail: {
                            type: "blocked-sandbox-token",
                            token: t,
                            element: this,
                        },
                    }));
                }
            });
        }
        return tokens.join(" ");
    }
    _updateIframeSrc() {
        const frame = this._iframe;
        if (!frame)
            return;
        // reset tracking
        this._bridgeReady = false;
        this._currentState = STATES.LOADING;
        this._updateContainerState();
        // clear existing
        frame.removeAttribute("src");
        frame.removeAttribute("srcdoc");
        if (this._src) {
            frame.setAttribute("src", this._src);
        }
        else if (this._srcdoc) {
            try {
                frame.setAttribute("srcdoc", this._srcdoc);
            }
            catch {
                frame.setAttribute("src", "about:blank");
            }
        }
        // load events
        frame.onload = this._handleIframeLoad;
        frame.onerror = this._handleIframeError;
        this._log("updateIframeSrc", this._src ? "src" : this._srcdoc ? "srcdoc" : "blank");
    }
    _handleIframeLoad = () => {
        this.dispatchEvent(new CustomEvent("iframe-loaded", {
            detail: { element: this },
            bubbles: true,
        }));
        this._log("iframe-loaded");
        this._readinessTimeout = setTimeout(() => {
            if (this._currentState !== STATES.LOADED) {
                this.dispatchEvent(new CustomEvent("widget-readiness-warning", {
                    detail: {
                        element: this,
                        message: "Widget may not be using Bridge for readiness signaling",
                    },
                    bubbles: true,
                }));
                this._log("widget-readiness-warning");
            }
        }, 3000);
    };
    _handleIframeError = (error) => {
        this.dispatchEvent(new CustomEvent("widget-error", {
            detail: { error, element: this },
        }));
    };
    _postToIframe(type, data) {
        const win = this._iframe?.contentWindow;
        if (!win)
            return;
        try {
            const msgType = `salesforce-${type}`;
            win.postMessage({ type: msgType, data, id: this._shellInstanceId }, "*");
            this._log("postMessage", msgType, data);
        }
        catch (e) {
            this._log("postMessage error", e instanceof Error ? e.message : String(e));
        }
    }
    _collectDataAttributes() {
        const out = {};
        for (let i = 0; i < this.attributes.length; i++) {
            const a = this.attributes[i];
            if (a.name.startsWith("data-")) {
                const raw = a.name.replace(/^data-/, "");
                // convert kebab-case to camelCase
                const camel = raw.replace(/-([a-z])/g, (_m, c) => c.toUpperCase());
                out[camel] = a.value;
            }
        }
        return out;
    }
    _sendInitialTheme() {
        const computed = getComputedStyle(this);
        const theme = {};
        for (let i = 0; i < computed.length; i++) {
            const name = computed[i];
            if (name.startsWith("--")) {
                const val = computed.getPropertyValue(name).trim();
                if (val)
                    theme[name] = val;
            }
        }
        this._lastThemeData = theme;
        if (this._bridgeReady) {
            this._postToIframe("theme", theme);
            this._hasSentTheme = true;
            this._log("send theme", theme);
        }
        else {
            this._log("queue theme until bridge ready", theme);
        }
    }
    _sendInitialData() {
        if (this._lastThemeData && Object.keys(this._lastThemeData).length) {
            this._postToIframe("theme", this._lastThemeData);
            this._hasSentTheme = true;
            this._log("send theme (initial)", this._lastThemeData);
        }
        const payload = this._collectDataAttributes();
        this._lastPayloadData = { ...payload };
        this._postToIframe("data", this._lastPayloadData);
        this._hasSentData = true;
        this._log("send data (initial)", this._lastPayloadData);
    }
}
// ---------------------------------------------------------------------------
// Register the custom element
// ---------------------------------------------------------------------------
if (!window.customElements.get("lwc-shell")) {
    window.customElements.define("lwc-shell", InternalHostLwcShell);
}

export { InternalHostLwcShell, InternalHostLwcShell as default };
//# sourceMappingURL=index.esm.js.map
