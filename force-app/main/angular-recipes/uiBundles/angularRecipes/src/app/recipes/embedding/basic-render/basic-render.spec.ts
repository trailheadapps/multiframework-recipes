import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { getViewSDK } from '@salesforce/platform-sdk';
import { BasicRenderComponent } from './basic-render';

vi.mock('@salesforce/platform-sdk', () => ({ getViewSDK: vi.fn() }));

type SubscribeCb = (next: { props: Record<string, unknown> }) => void;

// Stubs the embedding view SDK's ui-state channel: a synchronous getUiState()
// snapshot plus a subscribe() the test can drive via emit().
function stubUiState(initial: Record<string, unknown>) {
	const listeners: SubscribeCb[] = [];
	const state = { props: initial };
	return {
		getUiState: () => ({
			state,
			subscribe: (cb: SubscribeCb) => {
				listeners.push(cb);
				return () => {
					const i = listeners.indexOf(cb);
					if (i >= 0) listeners.splice(i, 1);
				};
			},
		}),
		emit: (next: Record<string, unknown>) => {
			state.props = next;
			listeners.forEach((cb) => cb({ props: next }));
		},
	};
}

async function render() {
	await TestBed.configureTestingModule({ imports: [BasicRenderComponent] }).compileComponents();
	const fixture = TestBed.createComponent(BasicRenderComponent);
	await fixture.whenStable();
	await new Promise((resolve) => setTimeout(resolve));
	fixture.detectChanges();
	return fixture;
}

describe('BasicRenderComponent', () => {
	afterEach(() => vi.clearAllMocks());

	it('renders the account fields from ui-state', async () => {
		(getViewSDK as Mock).mockResolvedValue(
			stubUiState({
				recordId: '001',
				name: 'Acme Corp',
				industry: 'Technology',
				type: 'Customer - Direct',
				website: 'acme.example',
			}),
		);
		const text = (await render()).nativeElement.textContent;
		expect(text).toContain('Acme Corp');
		expect(text).toContain('Technology');
		expect(text).toContain('Customer - Direct');
		expect(text).toContain('acme.example');
	});

	it('shows the waiting state when no props have arrived', async () => {
		(getViewSDK as Mock).mockResolvedValue(stubUiState({}));
		expect((await render()).nativeElement.textContent).toContain('Waiting for host');
	});

	it('updates when the host pushes new props', async () => {
		const view = stubUiState({ recordId: '001', name: 'Old' });
		(getViewSDK as Mock).mockResolvedValue(view);
		const fixture = await render();
		expect(fixture.nativeElement.textContent).toContain('Old');

		view.emit({ recordId: '001', name: 'New', industry: 'Retail' });
		fixture.detectChanges();
		expect(fixture.nativeElement.textContent).toContain('New');
		expect(fixture.nativeElement.textContent).toContain('Retail');
	});
});
