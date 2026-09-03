/**
 * Unsaved Changes — editable form over host Account props.
 *
 * Calls viewSDK.markDirtyState() when the form diverges from the host's saved
 * values and clearDirtyState() when they match again. Salesforce then shows a
 * Save/Discard toolbar on the record page and warns before navigation while
 * dirty.
 *
 * Save dispatches `guestsave`; the host writes to Salesforce and pushes fresh
 * values back through ui-state. A `saving` guard stops rapid re-clicks from
 * firing duplicate updateRecords, and a short timeout releases the guard if the
 * host's save fails silently, so Save never sticks.
 *
 * @see SendToHostComponent, ReadHostDataComponent
 */
import {
	ChangeDetectionStrategy,
	Component,
	OnDestroy,
	OnInit,
	computed,
	effect,
	signal,
} from '@angular/core';
import { getViewSDK } from '@salesforce/platform-sdk';
import { ButtonImports } from '../../../components/ui/button/button';
import { CardImports } from '../../../components/ui/card/card';
import { IconComponent } from '../../../components/ui/icon/icon';
import { InputImports } from '../../../components/ui/input/input';
import { SelectImports, type AppSelectOption } from '../../../components/ui/select/select';

type Rating = 'Hot' | 'Warm' | 'Cold';

interface AccountProps {
	recordId?: string;
	name?: string | null;
	rating?: Rating | null;
	type?: string | null;
}

const RATING_OPTIONS: AppSelectOption[] = ['Hot', 'Warm', 'Cold'].map((r) => ({
	value: r,
	label: r,
}));

const TYPE_OPTIONS: AppSelectOption[] = [
	'Prospect',
	'Customer - Direct',
	'Customer - Channel',
	'Channel Partner / Reseller',
	'Technology Partner',
].map((t) => ({ value: t, label: t }));

@Component({
	selector: 'app-unsaved-changes',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [ButtonImports, CardImports, IconComponent, InputImports, SelectImports],
	templateUrl: './unsaved-changes.html',
})
export class UnsavedChangesComponent implements OnInit, OnDestroy {
	protected readonly ratingOptions = RATING_OPTIONS;
	protected readonly typeOptions = TYPE_OPTIONS;

	protected readonly saved = signal<AccountProps>({});
	protected readonly form = signal<AccountProps>({});
	protected readonly connected = computed(() => Boolean(this.saved().recordId));
	protected readonly isDirty = computed(
		() =>
			this.form().name !== this.saved().name ||
			this.form().rating !== this.saved().rating ||
			this.form().type !== this.saved().type,
	);

	// Seeded once the host sends a payload with a recordId, so later host echoes
	// don't clobber in-progress edits.
	private seeded = false;
	// Stops rapid Save re-clicks from firing duplicate updateRecords.
	private saving = false;
	// Failsafe: releases `saving` if the host never echoes back (its save failed).
	private saveTimeout?: ReturnType<typeof setTimeout>;
	private destroyed = false;
	private unsubscribe?: () => void;

	constructor() {
		// Mirror the form's dirty state to the host once the form is seeded.
		effect(() => {
			const dirty = this.isDirty();
			if (!this.seeded) return;
			getViewSDK().then((sdk) => {
				if (dirty) sdk.markDirtyState?.();
				else sdk.clearDirtyState?.();
			});
		});
	}

	ngOnInit(): void {
		getViewSDK().then((sdk) => {
			if (this.destroyed) return;
			const ui = sdk.getUiState?.();
			if (!ui) return;
			this.seed(ui.state.props as AccountProps);
			this.unsubscribe = ui.subscribe((next) => {
				this.seed(next.props as AccountProps);
				// Host echoed fresh values → the save round-trip completed.
				this.saving = false;
				if (this.saveTimeout) clearTimeout(this.saveTimeout);
			});
		});
	}

	ngOnDestroy(): void {
		this.destroyed = true;
		this.unsubscribe?.();
		if (this.saveTimeout) clearTimeout(this.saveTimeout);
	}

	private seed(props: AccountProps): void {
		this.saved.set(props);
		if (!this.seeded && props.recordId) {
			this.form.set(props);
			this.seeded = true;
		}
	}

	protected setName(value: string): void {
		this.form.update((form) => ({ ...form, name: value }));
	}

	protected setRating(value: string): void {
		this.form.update((form) => ({ ...form, rating: (value || null) as Rating | null }));
	}

	protected setType(value: string): void {
		this.form.update((form) => ({ ...form, type: value || null }));
	}

	protected async save(): Promise<void> {
		if (this.saving) return;
		this.saving = true;
		const { name, rating, type } = this.form();
		const sdk = await getViewSDK();
		// All-lowercase, no hyphens, so the host LWC can bind it declaratively
		// (onguestsave) on the embedding element.
		sdk.dispatchEvent?.(
			new CustomEvent('guestsave', { detail: { name, rating, type }, bubbles: true }),
		);
		this.saveTimeout = setTimeout(() => {
			this.saving = false;
		}, 4000);
	}

	protected discard(): void {
		this.form.set(this.saved());
	}
}
