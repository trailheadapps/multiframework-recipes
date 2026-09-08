import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { getViewSDK } from '@salesforce/platform-sdk';
import { UnsavedChangesComponent } from './unsaved-changes';

vi.mock('@salesforce/platform-sdk', () => ({ getViewSDK: vi.fn() }));

function stubView(initial: Record<string, unknown>) {
	const listeners: ((next: { props: Record<string, unknown> }) => void)[] = [];
	const state = { props: initial };
	return {
		getUiState: () => ({
			state,
			subscribe: (cb: (next: { props: Record<string, unknown> }) => void) => {
				listeners.push(cb);
				return () => undefined;
			},
		}),
		emit: (next: Record<string, unknown>) => {
			state.props = next;
			listeners.forEach((cb) => cb({ props: next }));
		},
		dispatchEvent: vi.fn(),
		markDirtyState: vi.fn(),
		clearDirtyState: vi.fn(),
	};
}

async function render() {
	await TestBed.configureTestingModule({ imports: [UnsavedChangesComponent] }).compileComponents();
	const fixture = TestBed.createComponent(UnsavedChangesComponent);
	await fixture.whenStable();
	await new Promise((resolve) => setTimeout(resolve));
	fixture.detectChanges();
	return fixture;
}

describe('UnsavedChangesComponent', () => {
	afterEach(() => vi.clearAllMocks());

	it('prompts to connect when disconnected', async () => {
		(getViewSDK as Mock).mockResolvedValue(stubView({}));
		expect((await render()).nativeElement.textContent).toContain('Drop this component');
	});

	it('dispatches guestsave with the seeded form values', async () => {
		const view = stubView({ recordId: '001', name: 'Acme', rating: 'Warm', type: 'Prospect' });
		(getViewSDK as Mock).mockResolvedValue(view);
		const fixture = await render();

		const save = fixture.nativeElement.querySelector('app-button button') as HTMLButtonElement;
		save.click();
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));

		expect(view.dispatchEvent).toHaveBeenCalledTimes(1);
		const event = view.dispatchEvent.mock.calls[0][0] as CustomEvent;
		expect(event.type).toBe('guestsave');
		expect(event.detail).toEqual({ name: 'Acme', rating: 'Warm', type: 'Prospect' });
	});

	it('adopts a later host update while the form is pristine, without marking dirty', async () => {
		const view = stubView({ recordId: '001', name: 'Acme', rating: 'Warm', type: 'Prospect' });
		(getViewSDK as Mock).mockResolvedValue(view);
		const fixture = await render();
		const component = fixture.componentInstance as unknown as { form(): { name?: string | null } };
		view.markDirtyState.mockClear();

		view.emit({ recordId: '001', name: 'Acme Renamed', rating: 'Hot', type: 'Prospect' });
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));

		expect(component.form().name).toBe('Acme Renamed');
		expect(view.markDirtyState).not.toHaveBeenCalled();
	});

	it('keeps in-progress edits when the host updates in the background', async () => {
		const view = stubView({ recordId: '001', name: 'Acme', rating: 'Warm', type: 'Prospect' });
		(getViewSDK as Mock).mockResolvedValue(view);
		const fixture = await render();

		const component = fixture.componentInstance as unknown as {
			setName(value: string): void;
			form(): { name?: string | null };
		};
		component.setName('My Draft');
		view.emit({ recordId: '001', name: 'Server Rename', rating: 'Cold', type: 'Prospect' });

		expect(component.form().name).toBe('My Draft');
	});

	it('adopts the host echo after a save, even when the host normalized the values', async () => {
		const view = stubView({ recordId: '001', name: 'Acme', rating: 'Warm', type: 'Prospect' });
		(getViewSDK as Mock).mockResolvedValue(view);
		const fixture = await render();
		const component = fixture.componentInstance as unknown as {
			setName(value: string): void;
			form(): { name?: string | null };
			isDirty(): boolean;
		};

		component.setName('  Umbrella  ');
		const save = fixture.nativeElement.querySelector('app-button button') as HTMLButtonElement;
		save.click();
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));

		// Host trimmed the value and echoed the normalized form back.
		view.emit({ recordId: '001', name: 'Umbrella', rating: 'Warm', type: 'Prospect' });

		expect(component.form().name).toBe('Umbrella');
		expect(component.isDirty()).toBe(false);
	});
});
