import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { getViewSDK } from '@salesforce/platform-sdk';
import { UnsavedChangesComponent } from './unsaved-changes';

vi.mock('@salesforce/platform-sdk', () => ({ getViewSDK: vi.fn() }));

function stubView(props: Record<string, unknown>) {
	return {
		getUiState: () => ({ state: { props }, subscribe: () => () => undefined }),
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
});
