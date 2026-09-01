import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * SLDS Scope
 *
 * Wraps SLDS 2 blueprint markup in the required `.slds-scope` container. SLDS 2
 * is consumed scoped (see styles.css), so its blueprint classes only take effect
 * inside a `.slds-scope` element — which keeps SLDS out of the Tailwind/spartan
 * app shell. Put SLDS blueprint recipes inside <app-slds-scope>; leave the
 * spartan-ng recipes and app chrome outside it.
 */
@Component({
	selector: 'app-slds-scope',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: '<div class="slds-scope"><ng-content /></div>',
})
export class SldsScopeComponent {}
