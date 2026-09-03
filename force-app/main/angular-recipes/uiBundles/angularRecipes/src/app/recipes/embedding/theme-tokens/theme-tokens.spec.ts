import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { getViewSDK } from '@salesforce/platform-sdk';
import { ThemeTokensComponent } from './theme-tokens';

vi.mock('@salesforce/platform-sdk', () => ({ getViewSDK: vi.fn() }));

function stubView(props: Record<string, unknown>) {
	return { getUiState: () => ({ state: { props }, subscribe: () => () => undefined }) };
}

async function render() {
	await TestBed.configureTestingModule({ imports: [ThemeTokensComponent] }).compileComponents();
	const fixture = TestBed.createComponent(ThemeTokensComponent);
	await fixture.whenStable();
	await new Promise((resolve) => setTimeout(resolve));
	fixture.detectChanges();
	return fixture;
}

describe('ThemeTokensComponent', () => {
	afterEach(() => vi.clearAllMocks());

	it('applies the host-sent theme class to the wrapper', async () => {
		(getViewSDK as Mock).mockResolvedValue(
			stubView({ recordId: '001', theme: 'salesforce', name: 'Acme' }),
		);
		const wrapper = (await render()).nativeElement.querySelector('div');
		expect(wrapper.className).toContain('salesforce');
	});

	it('defaults to the light theme before the host responds', async () => {
		(getViewSDK as Mock).mockResolvedValue(stubView({}));
		const fixture = await render();
		expect(fixture.nativeElement.querySelector('div').className).toContain('light');
		expect(fixture.nativeElement.textContent).toContain('Waiting for host');
	});
});
