import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { getViewSDK } from '@salesforce/platform-sdk';
import { ReadHostDataComponent } from './read-host-data';

vi.mock('@salesforce/platform-sdk', () => ({ getViewSDK: vi.fn() }));

type SubscribeCb = (next: { props: Record<string, unknown> }) => void;

function stubUiState(initial: Record<string, unknown>) {
	const listeners: SubscribeCb[] = [];
	const state = { props: initial };
	return {
		getUiState: () => ({
			state,
			subscribe: (cb: SubscribeCb) => {
				listeners.push(cb);
				return () => undefined;
			},
		}),
		emit: (next: Record<string, unknown>) => {
			state.props = next;
			listeners.forEach((cb) => cb({ props: next }));
		},
	};
}

async function render() {
	await TestBed.configureTestingModule({ imports: [ReadHostDataComponent] }).compileComponents();
	const fixture = TestBed.createComponent(ReadHostDataComponent);
	await fixture.whenStable();
	await new Promise((resolve) => setTimeout(resolve));
	fixture.detectChanges();
	return fixture;
}

describe('ReadHostDataComponent', () => {
	afterEach(() => vi.clearAllMocks());

	it('renders the account fields from ui-state', async () => {
		(getViewSDK as Mock).mockResolvedValue(
			stubUiState({ recordId: '001', name: 'Acme Corp', rating: 'Hot', industry: 'Technology' }),
		);
		const text = (await render()).nativeElement.textContent;
		expect(text).toContain('Acme Corp');
		expect(text).toContain('Hot');
		expect(text).toContain('Technology');
	});

	it('counts each host push', async () => {
		const view = stubUiState({ recordId: '001', name: 'Acme' });
		(getViewSDK as Mock).mockResolvedValue(view);
		const fixture = await render();

		view.emit({ recordId: '001', name: 'Acme', rating: 'Warm' });
		fixture.detectChanges();
		expect(fixture.nativeElement.textContent).toContain('1 update received');
	});

	it('prompts to connect when no record is present', async () => {
		(getViewSDK as Mock).mockResolvedValue(stubUiState({}));
		expect((await render()).nativeElement.textContent).toContain('Drop this component');
	});
});
