import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonImports } from '../../../components/ui/button/button';

/**
 * Button — spartan-ng (the app shell's button)
 *
 * The app's own button component, built on spartan-ng's helm (hlm) primitives +
 * Tailwind — the Angular counterpart of shadcn/ui. Best for custom UIs that
 * don't need to match the Salesforce look and feel. This is the button used
 * throughout the app shell.
 *
 * @see ButtonSldsComponent — the same buttons with SLDS blueprint classes
 */
@Component({
	selector: 'app-button-shadcn',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [ButtonImports],
	templateUrl: './button-shadcn.html',
})
export class ButtonShadcnComponent {}
