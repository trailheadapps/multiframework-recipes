import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { createDataSDK } from '@salesforce/platform-sdk';
import { ServerErrorHandlingComponent } from './server-error-handling';

vi.mock('@salesforce/platform-sdk', () => ({
	createDataSDK: vi.fn(),
	gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const mockMutate = vi.fn();

describe('ServerErrorHandlingComponent', () => {
	beforeEach(() => {
		(createDataSDK as Mock).mockResolvedValue({ graphql: { mutate: mockMutate } });
	});

	afterEach(() => vi.clearAllMocks());

	it('surfaces a top-level GraphQL error from result.errors', async () => {
		mockMutate.mockResolvedValue({ errors: [{ message: 'Required fields are missing: [LastName]' }] });
		await TestBed.configureTestingModule({ imports: [ServerErrorHandlingComponent] }).compileComponents();
		const fixture = TestBed.createComponent(ServerErrorHandlingComponent);
		fixture.detectChanges();
		(fixture.nativeElement.querySelector('app-button button') as HTMLButtonElement).click();
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));
		fixture.detectChanges();
		expect(fixture.nativeElement.textContent).toContain('GraphQL error:');
		expect(fixture.nativeElement.textContent).toContain('LastName');
	});
});
