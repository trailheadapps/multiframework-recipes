/**
 * Auto-Resize
 *
 * Add or remove items; the embedded iframe's height follows the guest's
 * content automatically. The SDK watches document.body and reports height
 * changes to the host, which resizes the iframe — no SDK call is needed here.
 *
 * viewSDK.resize(width, height) is available to set the size explicitly; it
 * accepts pixel strings like "800" or "800px".
 *
 * @see ThemeTokensComponent — receiving host-sent design tokens
 */
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonImports } from '../../../components/ui/button/button';
import { CardImports } from '../../../components/ui/card/card';
import { IconComponent } from '../../../components/ui/icon/icon';

interface Item {
	id: number;
	text: string;
}

@Component({
	selector: 'app-auto-resize',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [ButtonImports, CardImports, IconComponent],
	templateUrl: './auto-resize.html',
})
export class AutoResizeComponent {
	private nextId = 3;
	protected readonly items = signal<Item[]>([
		{ id: 1, text: 'Item 1' },
		{ id: 2, text: 'Item 2' },
	]);

	protected addItem(): void {
		const id = this.nextId++;
		this.items.update((items) => [
			...items,
			{ id, text: `Item ${id} — added at ${new Date().toLocaleTimeString()}` },
		]);
	}

	protected removeItem(id: number): void {
		this.items.update((items) => items.filter((item) => item.id !== id));
	}

	protected clear(): void {
		this.items.set([]);
	}
}
