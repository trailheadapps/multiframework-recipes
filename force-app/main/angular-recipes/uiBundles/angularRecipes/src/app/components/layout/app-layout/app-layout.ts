import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCode } from '@ng-icons/lucide';
import { SearchBarComponent } from '../../app/search-bar/search-bar';

@Component({
	selector: 'app-layout',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [RouterLink, RouterLinkActive, RouterOutlet, NgIcon, SearchBarComponent],
	providers: [provideIcons({ lucideCode })],
	templateUrl: './app-layout.html',
})
export class AppLayoutComponent {
	// Top-nav links are derived from the router config: any child route flagged
	// with `data.showInNavigation` appears here, so adding a category is a
	// one-line change in app.routes.ts.
	readonly navigationItems = (inject(ActivatedRoute).routeConfig?.children ?? [])
		.filter((route) => route.data?.['showInNavigation'])
		.map((route) => ({ path: `/${route.path}`, label: route.data?.['label'] as string }));
}
