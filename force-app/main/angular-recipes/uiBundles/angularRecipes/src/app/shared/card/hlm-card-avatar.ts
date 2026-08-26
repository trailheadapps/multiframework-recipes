import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/styles/utils';

@Directive({
	selector: '[hlmCardAvatar]',
	host: { 'data-slot': 'card-avatar' },
})
export class HlmCardAvatar {
	constructor() {
		classes(
			() => 'col-start-1 row-span-2 row-start-1 self-center size-10 rounded-full object-cover',
		);
	}
}
