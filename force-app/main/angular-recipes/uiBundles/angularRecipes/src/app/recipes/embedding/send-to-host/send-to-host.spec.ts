import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { getViewSDK } from '@salesforce/platform-sdk';
import { SendToHostComponent } from './send-to-host';

vi.mock('@salesforce/platform-sdk', () => ({ getViewSDK: vi.fn() }));

function stubView(props: Record<string, unknown>) {
	return {
		getUiState: () => ({ state: { props }, subscribe: () => () => undefined }),
		dispatchEvent: vi.fn(),
	};
}

async function render() {
	await TestBed.configureTestingModule({ imports: [SendToHostComponent] }).compileComponents();
	const fixture = TestBed.createComponent(SendToHostComponent);
	await fixture.whenStable();
	await new Promise((resolve) => setTimeout(resolve));
	fixture.detectChanges();
	return fixture;
}

describe('SendToHostComponent', () => {
	afterEach(() => vi.clearAllMocks());

	it('disables every cell until a record arrives', async () => {
		(getViewSDK as Mock).mockResolvedValue(stubView({}));
		const buttons = (await render()).nativeElement.querySelectorAll('button');
		expect(buttons.length).toBeGreaterThan(0);
		buttons.forEach((btn: HTMLButtonElement) => expect(btn.disabled).toBe(true));
	});

	it('dispatches a score event with the cell payload', async () => {
		const view = stubView({ recordId: '001', rating: 'Warm', type: 'Prospect' });
		(getViewSDK as Mock).mockResolvedValue(view);
		const fixture = await render();

		const cell = fixture.nativeElement.querySelector(
			'button[aria-label*="high engagement, strong fit"]',
		) as HTMLButtonElement;
		cell.click();
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));

		expect(view.dispatchEvent).toHaveBeenCalledTimes(1);
		const event = view.dispatchEvent.mock.calls[0][0] as CustomEvent;
		expect(event.type).toBe('score');
		expect(event.detail).toEqual({ rating: 'Hot', type: 'Customer - Direct' });
	});
});
