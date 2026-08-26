import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
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
	// Category links shown in the top nav. Add an entry here as each category
	// is ported and routed.
	readonly navigationItems = [{ path: '/hello', label: 'Hello' }];
}
