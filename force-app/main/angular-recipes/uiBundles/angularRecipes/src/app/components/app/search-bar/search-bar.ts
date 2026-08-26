import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	computed,
	effect,
	inject,
	signal,
	viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { IconComponent } from '../../ui/icon/icon';
import { recipeRegistry, type RecipeEntry } from '../../../recipe-registry';

interface RecipeGroup {
	category: string;
	entries: RecipeEntry[];
}

/**
 * Global recipe search. Filters the recipe registry by name/description and
 * navigates to the matching category, deep-linking the recipe via `?recipe`.
 * Mirrors the React app's SearchBar (Cmd/Ctrl+K to open, arrows to move).
 */
@Component({
	selector: 'app-search-bar',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [IconComponent],
	host: {
		class: 'relative block',
		'(document:keydown)': 'onGlobalKey($event)',
	},
	templateUrl: './search-bar.html',
})
export class SearchBarComponent {
	private readonly router = inject(Router);

	private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

	protected readonly open = signal(false);
	protected readonly query = signal('');
	protected readonly selectedIndex = signal(0);

	protected readonly isMac =
		typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent);

	constructor() {
		// Focus the input once it renders when the dropdown opens.
		effect(() => {
			if (this.open()) this.searchInput()?.nativeElement.focus();
		});
	}

	protected readonly groups = computed<RecipeGroup[]>(() => {
		const q = this.query().trim().toLowerCase();
		if (!q) return [];
		const map = new Map<string, RecipeEntry[]>();
		for (const r of recipeRegistry) {
			if (!r.name.toLowerCase().includes(q) && !r.description.toLowerCase().includes(q)) continue;
			const entries = map.get(r.category) ?? [];
			entries.push(r);
			map.set(r.category, entries);
		}
		return Array.from(map, ([category, entries]) => ({ category, entries }));
	});

	protected readonly flatResults = computed<RecipeEntry[]>(() =>
		this.groups().flatMap((g) => g.entries),
	);

	protected openSearch(): void {
		this.query.set('');
		this.selectedIndex.set(0);
		this.open.set(true);
	}

	protected close(): void {
		this.open.set(false);
	}

	protected updateQuery(value: string): void {
		this.query.set(value);
		this.selectedIndex.set(0);
	}

	protected onGlobalKey(event: KeyboardEvent): void {
		if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
			event.preventDefault();
			if (this.open()) {
				this.close();
			} else {
				this.openSearch();
			}
		} else if (event.key === 'Escape') {
			this.close();
		}
	}

	protected onInputKey(event: KeyboardEvent): void {
		const results = this.flatResults();
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			this.selectedIndex.update((i) => Math.min(i + 1, results.length - 1));
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			this.selectedIndex.update((i) => Math.max(i - 1, 0));
		} else if (event.key === 'Enter') {
			const entry = results[this.selectedIndex()];
			if (entry) {
				event.preventDefault();
				this.navigateTo(entry);
			}
		}
	}

	protected navigateTo(entry: RecipeEntry): void {
		this.close();
		this.router.navigate([entry.categoryRoute], {
			queryParams: entry.recipeIndex > 0 ? { recipe: entry.recipeIndex } : {},
		});
	}

	protected flatIndexOf(entry: RecipeEntry): number {
		return this.flatResults().indexOf(entry);
	}
}
