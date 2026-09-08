import type { Mock } from 'vitest';
import { createDataSDK } from '@salesforce/platform-sdk';
import { NestedRoutesStore } from './nested-routes-store';

vi.mock('@salesforce/platform-sdk', () => ({
	createDataSDK: vi.fn(),
	gql: (strings: TemplateStringsArray) => strings.join(''),
}));

const mockQuery = vi.fn();

describe('NestedRoutesStore', () => {
	beforeEach(() => {
		(createDataSDK as Mock).mockResolvedValue({ graphql: { query: mockQuery } });
	});

	afterEach(() => vi.clearAllMocks());

	it('loads accounts once and looks them up by id', async () => {
		mockQuery.mockResolvedValue({
			data: { uiapi: { query: { Account: { edges: [{ node: { Id: '001A', Name: { value: 'Acme' }, Industry: { value: 'Technology' } } }] } } } },
		});
		const store = new NestedRoutesStore();
		await store.load();
		expect(store.loaded()).toBe(true);
		expect(store.accounts()).toHaveLength(1);
		expect(store.find('001A')?.name).toBe('Acme');

		await store.load();
		expect(mockQuery).toHaveBeenCalledTimes(1); // second load is a no-op
	});

	it('does not latch loaded on failure, so a later load retries', async () => {
		mockQuery.mockRejectedValueOnce(new Error('boom'));
		const store = new NestedRoutesStore();
		await store.load();
		expect(store.error()).toBe('boom');
		expect(store.loaded()).toBe(false);

		mockQuery.mockResolvedValueOnce({
			data: { uiapi: { query: { Account: { edges: [{ node: { Id: '001A', Name: { value: 'Acme' }, Industry: { value: null } } }] } } } },
		});
		await store.load();
		expect(store.loaded()).toBe(true);
		expect(store.accounts()).toHaveLength(1);
		expect(mockQuery).toHaveBeenCalledTimes(2);
	});

	it('dedupes concurrent loads into a single request', async () => {
		mockQuery.mockResolvedValue({
			data: { uiapi: { query: { Account: { edges: [{ node: { Id: '001A', Name: { value: 'Acme' }, Industry: { value: null } } }] } } } },
		});
		const store = new NestedRoutesStore();
		await Promise.all([store.load(), store.load()]);
		expect(mockQuery).toHaveBeenCalledTimes(1);
	});
});
