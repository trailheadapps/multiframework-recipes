import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
	lucideBell,
	lucideBriefcase,
	lucideBuilding2,
	lucideCalendar,
	lucideChevronRight,
	lucideDownload,
	lucideHouse,
	lucideLock,
	lucideMail,
	lucidePencil,
	lucidePlus,
	lucideSearch,
	lucideSettings,
	lucideSquareCheck,
	lucideStar,
	lucideTrash2,
	lucideTrendingUp,
	lucideUpload,
	lucideUser,
	lucideUsers,
} from '@ng-icons/lucide';

// Lucide icons via @ng-icons: each is registered by name (provideIcons) and
// rendered with <ng-icon>. Unlike SLDS sprites, these are individual,
// tree-shakable, stroke-based icons sized with a font-relative size.
const ICONS = [
	{ name: 'lucideHouse', label: 'Home' },
	{ name: 'lucideSettings', label: 'Settings' },
	{ name: 'lucidePlus', label: 'Plus' },
	{ name: 'lucideTrash2', label: 'Trash2' },
	{ name: 'lucideSearch', label: 'Search' },
	{ name: 'lucidePencil', label: 'Pencil' },
	{ name: 'lucideUser', label: 'User' },
	{ name: 'lucideBuilding2', label: 'Building2' },
	{ name: 'lucideTrendingUp', label: 'TrendingUp' },
	{ name: 'lucideUsers', label: 'Users' },
	{ name: 'lucideBriefcase', label: 'Briefcase' },
	{ name: 'lucideSquareCheck', label: 'SquareCheck' },
	{ name: 'lucideBell', label: 'Bell' },
	{ name: 'lucideMail', label: 'Mail' },
	{ name: 'lucideCalendar', label: 'Calendar' },
	{ name: 'lucideChevronRight', label: 'ChevronRight' },
	{ name: 'lucideStar', label: 'Star' },
	{ name: 'lucideLock', label: 'Lock' },
	{ name: 'lucideUpload', label: 'Upload' },
	{ name: 'lucideDownload', label: 'Download' },
];

/**
 * Icons — Lucide (@ng-icons)
 *
 * Lucide icons rendered as individual <ng-icon> components rather than SVG
 * sprites — tree-shakable and stroke-based. Best for custom UIs that don't need
 * the Salesforce visual system.
 *
 * @see IconsSldsComponent — the same idea via SLDS SVG sprite references
 */
@Component({
	selector: 'app-icons-lucide',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [NgIcon],
	providers: [
		provideIcons({
			lucideHouse,
			lucideSettings,
			lucidePlus,
			lucideTrash2,
			lucideSearch,
			lucidePencil,
			lucideUser,
			lucideBuilding2,
			lucideTrendingUp,
			lucideUsers,
			lucideBriefcase,
			lucideSquareCheck,
			lucideBell,
			lucideMail,
			lucideCalendar,
			lucideChevronRight,
			lucideStar,
			lucideLock,
			lucideUpload,
			lucideDownload,
		}),
	],
	templateUrl: './icons-lucide.html',
})
export class IconsLucideComponent {
	protected readonly icons = ICONS;
}
