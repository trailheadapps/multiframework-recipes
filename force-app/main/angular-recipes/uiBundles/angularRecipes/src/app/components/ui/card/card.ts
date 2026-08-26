import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
	HlmCard,
	HlmCardAction,
	HlmCardAvatar,
	HlmCardContent,
	HlmCardDescription,
	HlmCardFooter,
	HlmCardHeader,
	HlmCardTitle,
} from '@spartan-ng/styles/card';

export type AppCardSize = 'default' | 'sm';

@Component({
	selector: 'app-card',
	changeDetection: ChangeDetectionStrategy.OnPush,
	hostDirectives: [{ directive: HlmCard, inputs: ['size'] }],
	host: { '[class]': 'classes()' },
	template: '<ng-content />',
})
export class CardComponent {
	readonly size = input<AppCardSize>('default');
	readonly classes = input<string>('', { alias: 'class' });
}

@Component({
	selector: 'app-card-header',
	changeDetection: ChangeDetectionStrategy.OnPush,
	hostDirectives: [HlmCardHeader],
	host: { '[class]': 'classes()' },
	template: '<ng-content />',
})
export class CardHeaderComponent {
	readonly classes = input<string>('', { alias: 'class' });
}

@Component({
	selector: 'app-card-title',
	changeDetection: ChangeDetectionStrategy.OnPush,
	hostDirectives: [HlmCardTitle],
	template: '<ng-content />',
})
export class CardTitleComponent {}

@Component({
	selector: 'app-card-description',
	changeDetection: ChangeDetectionStrategy.OnPush,
	hostDirectives: [HlmCardDescription],
	template: '<ng-content />',
})
export class CardDescriptionComponent {}

@Component({
	selector: 'app-card-avatar',
	changeDetection: ChangeDetectionStrategy.OnPush,
	hostDirectives: [HlmCardAvatar],
	template: '<ng-content />',
})
export class CardAvatarComponent {}

@Component({
	selector: 'app-card-action',
	changeDetection: ChangeDetectionStrategy.OnPush,
	hostDirectives: [HlmCardAction],
	template: '<ng-content />',
})
export class CardActionComponent {}

@Component({
	selector: 'app-card-content',
	changeDetection: ChangeDetectionStrategy.OnPush,
	hostDirectives: [HlmCardContent],
	template: '<ng-content />',
})
export class CardContentComponent {}
@Component({
	selector: 'app-card-footer',
	changeDetection: ChangeDetectionStrategy.OnPush,
	hostDirectives: [HlmCardFooter],
	host: { class: 'gap-2' },
	template: '<ng-content />',
})
export class CardFooterComponent {}

export const CardImports = [
	CardComponent,
	CardHeaderComponent,
	CardTitleComponent,
	CardDescriptionComponent,
	CardAvatarComponent,
	CardActionComponent,
	CardContentComponent,
	CardFooterComponent,
] as const;
