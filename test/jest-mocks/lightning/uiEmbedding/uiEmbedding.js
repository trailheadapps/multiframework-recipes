/**
 * Jest stub for the lightning/uiEmbedding base component.
 * The real <lightning-ui-embedding> (Developer Preview) isn't part of the
 * sfdx-lwc-jest stub set, so this renders a placeholder that just exposes the
 * public props the host binds to, letting host tests assert src/props/events.
 */
import { LightningElement, api } from "lwc";

export default class UiEmbedding extends LightningElement {
  @api src;
  @api props;
  @api sandbox;
  @api shellTitle;
}
