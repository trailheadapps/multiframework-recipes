import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';
import { createDataSDK } from '@salesforce/platform-sdk';
import { CreateRecordComponent } from './create-record';

vi.mock('@salesforce/platform-sdk', () => ({
	createDataSDK: vi.fn(),
	gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const mockMutate = vi.fn();

describe('CreateRecordComponent', () => {
	beforeEach(() => {
		(createDataSDK as Mock).mockResolvedValue({ graphql: { mutate: mockMutate } });
	});

	afterEach(() => vi.clearAllMocks());

	it('submits AccountCreate and shows the created record', async () => {
		mockMutate.mockResolvedValue({ data: { uiapi: { AccountCreate: { Record: { Id: '001X', Name: { value: 'Acme Corp' } } } } } });
		await TestBed.configureTestingModule({ imports: [CreateRecordComponent] }).compileComponents();
		const fixture = TestBed.createComponent(CreateRecordComponent);
		fixture.detectChanges();

		const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
		input.value = 'Acme Corp';
		input.dispatchEvent(new Event('input'));
		fixture.detectChanges();
		(fixture.nativeElement.querySelector('app-button button') as HTMLButtonElement).click();
		await fixture.whenStable();
		await new Promise((resolve) => setTimeout(resolve));
		fixture.detectChanges();

		expect(mockMutate.mock.calls[0][0].variables).toEqual({ input: { Account: { Name: 'Acme Corp' } } });
		expect(fixture.nativeElement.textContent).toContain('Account created');
		expect(fixture.nativeElement.textContent).toContain('001X');
	});
});
