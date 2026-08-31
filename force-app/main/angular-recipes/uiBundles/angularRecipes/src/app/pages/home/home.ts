import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCode } from '@ng-icons/lucide';
import { CardImports } from '../../components/ui/card/card';
import { getRecipeCount } from '../../recipe-registry';

@Component({
	selector: 'app-home',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [RouterLink, NgIcon, CardImports],
	providers: [provideIcons({ lucideCode })],
	templateUrl: './home.html',
})
export class HomeComponent {
	// Category tiles. A category appears here once it is ported and routed.
	protected readonly categories = [
		{
			to: '/hello',
			name: 'Hello',
			description:
				'Start here. Covers template binding, conditional and list rendering, lifecycle, and component composition with inputs and outputs.',
			count: getRecipeCount('/hello'),
		},
	];
}
