/**
 * GraphQL Data (Indirect Access)
 *
 * The guest side of the "indirect Salesforce data access" pattern. An
 * externally hosted micro-frontend has no direct org data access, so it never
 * runs a GraphQL query itself. The host LWC (uiEmbeddingGraphqlData) runs one
 * query that walks an Account to its related Contacts and pushes the rows DOWN
 * as a `contactsdata` event, with the payload on event.detail. This component
 * listens with viewSDK.addEventListener() and renders what arrives.
 *
 * Events are fire-and-forget (no retained snapshot), so once the listener is
 * attached we dispatch `requestcontacts` to ask the host to (re)send the
 * current data — covering the case where the host pushed before this iframe
 * finished loading.
 *
 * @see ReceiveEventComponent — host → guest events (signal only)
 * @see SendToHostComponent — guest → host events (payload on detail)
 */
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { getViewSDK } from '@salesforce/platform-sdk';
import { CardImports } from '../../../components/ui/card/card';
import { IconComponent } from '../../../components/ui/icon/icon';

interface ContactRow {
	id: string;
	name: string | null;
	title: string | null;
	email: string | null;
	phone: string | null;
}

interface GraphqlDataProps {
	accountName?: string | null;
	contacts?: ContactRow[];
	error?: string;
	// True once the host's GraphQL query has emitted. Tells "still loading"
	// apart from "loaded, but this account has no contacts".
	loaded?: boolean;
}

@Component({
	selector: 'app-graphql-data',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CardImports, IconComponent],
	templateUrl: './graphql-data.html',
})
export class GraphqlDataComponent implements OnInit, OnDestroy {
	protected readonly data = signal<GraphqlDataProps>({});
	protected readonly contacts = computed(() => this.data().contacts ?? []);
	protected readonly accountName = computed(() => this.data().accountName ?? 'the account');

	private destroyed = false;
	private detach?: () => void;

	ngOnInit(): void {
		getViewSDK().then((sdk) => {
			if (this.destroyed) return;

			// Host → guest: the contacts the host fetched arrive on event.detail.
			const onContacts = (event: Event): void => {
				this.data.set(((event as CustomEvent).detail ?? {}) as GraphqlDataProps);
			};
			sdk.addEventListener?.('contactsdata', onContacts);

			// Now that we're listening, ask the host to (re)send the current data.
			sdk.dispatchEvent?.(new CustomEvent('requestcontacts', { bubbles: true }));

			this.detach = () => sdk.removeEventListener?.('contactsdata', onContacts);
		});
	}

	ngOnDestroy(): void {
		this.destroyed = true;
		this.detach?.();
	}
}
