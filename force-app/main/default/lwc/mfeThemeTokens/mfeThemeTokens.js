import { LightningElement, api, track } from 'lwc';

/**
 * Demo host LWC that pushes host-owned theme tokens into an embedded iframe
 * via CSS custom properties on <lightning-embedding>.
 *
 * The bridge's `ui-state.styles.variables` channel mirrors CSS custom
 * properties (`--*`) from the host element's inline style down to the guest.
 * The React app reads them through `view.getUiState().state.styles.variables`
 * and re-applies them on its own root.
 */
export default class ThemeTokenEmbed extends LightningElement {
    @api baseUrl = 'http://localhost:5173';
    debug = true;

    @track brandPrimary = '#2563eb';
    @track brandBackground = '#ffffff';
    @track brandText = '#111827';
    @track brandRadiusValue = 8;
    @track brandSpacingValue = 16;
    @track brandFontSizeValue = 14;

    get brandRadius() {
        return `${this.brandRadiusValue}px`;
    }

    get brandSpacing() {
        return `${this.brandSpacingValue}px`;
    }

    get brandFontSize() {
        return `${this.brandFontSizeValue}px`;
    }

    get computedSrc() {
        const url = new URL(this.baseUrl);
        url.pathname = '/embedding/theme-tokens';
        return url.toString();
    }

    // Tokens are published on TWO bridge channels so the guest reflects
    // changes regardless of the deployed <lightning-embedding> version:
    //
    //   1. `style={themeStyle}` — inline CSS custom properties. Newer base
    //      components forward these as `state.styles.variables`.
    //   2. `props={themeProps}` — the typed @api prop bag, forwarded as
    //      `state.props` on every base-component version.
    //
    // Both re-evaluate on any @track change, so a slider/preset click flushes
    // a fresh ui-state-changed the guest picks up via view.getUiState().
    get themeStyle() {
        return (
            `--brand-primary: ${this.brandPrimary};` +
            `--brand-background: ${this.brandBackground};` +
            `--brand-text: ${this.brandText};` +
            `--brand-radius: ${this.brandRadius};` +
            `--brand-spacing: ${this.brandSpacing};` +
            `--brand-font-size: ${this.brandFontSize};`
        );
    }

    // Fresh object identity each read: the embedding's props setter uses
    // reference equality to decide whether to flush ui-state-changed.
    get themeProps() {
        return {
            brandPrimary: this.brandPrimary,
            brandBackground: this.brandBackground,
            brandText: this.brandText,
            brandRadius: this.brandRadius,
            brandSpacing: this.brandSpacing,
            brandFontSize: this.brandFontSize,
        };
    }

    onPrimary(event) {
        this.brandPrimary = event.target.value;
    }

    onBackground(event) {
        this.brandBackground = event.target.value;
    }

    onText(event) {
        this.brandText = event.target.value;
    }

    onRadius(event) {
        this.brandRadiusValue = Number(event.target.value);
    }

    onSpacing(event) {
        this.brandSpacingValue = Number(event.target.value);
    }

    onFontSize(event) {
        this.brandFontSizeValue = Number(event.target.value);
    }

    applyLightPreset() {
        this.brandPrimary = '#2563eb';
        this.brandBackground = '#ffffff';
        this.brandText = '#111827';
        this.brandRadiusValue = 8;
        this.brandSpacingValue = 16;
        this.brandFontSizeValue = 14;
    }

    applyDarkPreset() {
        this.brandPrimary = '#60a5fa';
        this.brandBackground = '#0f172a';
        this.brandText = '#e2e8f0';
        this.brandRadiusValue = 6;
        this.brandSpacingValue = 20;
        this.brandFontSizeValue = 15;
    }

    applyBrandPreset() {
        this.brandPrimary = '#f97316';
        this.brandBackground = '#fff7ed';
        this.brandText = '#7c2d12';
        this.brandRadiusValue = 16;
        this.brandSpacingValue = 24;
        this.brandFontSizeValue = 16;
    }
}
