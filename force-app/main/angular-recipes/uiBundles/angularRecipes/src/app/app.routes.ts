import { Routes } from '@angular/router';
import { AppLayoutComponent } from './components/layout/app-layout/app-layout';
import { HomeComponent } from './pages/home/home';
import { HelloComponent } from './pages/hello/hello';
import { ReadDataComponent } from './pages/read-data/read-data';
import { ErrorHandlingComponent } from './pages/error-handling/error-handling';
import { SalesforceApisComponent } from './pages/salesforce-apis/salesforce-apis';
import { IntegrationComponent } from './pages/integration/integration';
import { ModifyDataComponent } from './pages/modify-data/modify-data';
import { StylingComponent } from './pages/styling/styling';
import { RoutingComponent } from './pages/routing/routing';
import { RouteParametersDetailComponent } from './recipes/routing/route-parameters-detail/route-parameters-detail';
import { NestedRoutesComponent } from './recipes/routing/nested-routes/nested-routes';
import { NestedRoutesIndexComponent } from './recipes/routing/nested-routes/nested-routes-index';
import { NestedRoutesDetailComponent } from './recipes/routing/nested-routes/nested-routes-detail';
import { NestedRoutesStore } from './recipes/routing/nested-routes/nested-routes-store';
import { NotFoundComponent } from './pages/not-found/not-found';
import { EmbeddingComponent } from './pages/embedding/embedding';
import { GuestLayoutComponent } from './recipes/embedding/guest-layout';
import { BasicRenderComponent } from './recipes/embedding/basic-render/basic-render';
import { ReadHostDataComponent } from './recipes/embedding/read-host-data/read-host-data';
import { SendToHostComponent } from './recipes/embedding/send-to-host/send-to-host';
import { UnsavedChangesComponent } from './recipes/embedding/unsaved-changes/unsaved-changes';
import { ThemeTokensComponent } from './recipes/embedding/theme-tokens/theme-tokens';
import { AutoResizeComponent } from './recipes/embedding/auto-resize/auto-resize';
import { ReceiveEventComponent } from './recipes/embedding/receive-event/receive-event';

export const routes: Routes = [
	// Chromeless embedding guests, rendered OUTSIDE the app shell so the host
	// iframe shows only the recipe. Each carries its full `embedding/<slug>`
	// path and wraps its recipe in GuestLayout; being matched before the shell,
	// these win over the shell's `**`, while `/embedding` (no match here) falls
	// through to the shell's index. Full paths (rather than an empty-path parent)
	// keep the guests from swallowing `/`. Loaded by the uiEmbedding* LWC hosts
	// via <lightning-ui-embedding src=".../embedding/<recipe>">.
	{
		path: 'embedding/basic-render',
		component: GuestLayoutComponent,
		children: [{ path: '', component: BasicRenderComponent }],
	},
	{
		path: 'embedding/send-to-host',
		component: GuestLayoutComponent,
		children: [{ path: '', component: SendToHostComponent }],
	},
	{
		path: 'embedding/read-host-data',
		component: GuestLayoutComponent,
		children: [{ path: '', component: ReadHostDataComponent }],
	},
	{
		path: 'embedding/unsaved-changes',
		component: GuestLayoutComponent,
		children: [{ path: '', component: UnsavedChangesComponent }],
	},
	{
		path: 'embedding/theme-tokens',
		component: GuestLayoutComponent,
		children: [{ path: '', component: ThemeTokensComponent }],
	},
	{
		path: 'embedding/auto-resize',
		component: GuestLayoutComponent,
		children: [{ path: '', component: AutoResizeComponent }],
	},
	{
		path: 'embedding/receive-event',
		component: GuestLayoutComponent,
		children: [{ path: '', component: ReceiveEventComponent }],
	},
	{
		path: '',
		component: AppLayoutComponent,
		children: [
			{
				path: '',
				component: HomeComponent,
			},
			{
				path: 'hello',
				component: HelloComponent,
				data: { showInNavigation: true, label: 'Hello' },
			},
			{
				path: 'read-data',
				component: ReadDataComponent,
				data: { showInNavigation: true, label: 'Read Data' },
			},
			{
				path: 'modify-data',
				component: ModifyDataComponent,
				data: { showInNavigation: true, label: 'Modify Data' },
			},
			{
				path: 'salesforce-apis',
				component: SalesforceApisComponent,
				data: { showInNavigation: true, label: 'Salesforce APIs' },
			},
			{
				path: 'integration',
				component: IntegrationComponent,
				data: { showInNavigation: true, label: 'Integration' },
			},
			{
				path: 'error-handling',
				component: ErrorHandlingComponent,
				data: { showInNavigation: true, label: 'Error Handling' },
			},
			{
				path: 'styling',
				component: StylingComponent,
				data: { showInNavigation: true, label: 'Styling' },
			},
			{
				path: 'routing',
				component: RoutingComponent,
				data: { showInNavigation: true, label: 'Routing' },
			},
			// Dedicated routes for the Routing recipes that need real sub-routes.
			// No showInNavigation, so they stay out of the top nav; they're reached
			// from links inside the Routing gallery.
			{
				path: 'routing/route-parameters/:accountId',
				component: RouteParametersDetailComponent,
			},
			{
				path: 'routing/nested-routes',
				component: NestedRoutesComponent,
				// Route-scoped store shared by the layout and its child routes.
				providers: [NestedRoutesStore],
				children: [
					{ path: '', component: NestedRoutesIndexComponent },
					{ path: ':accountId', component: NestedRoutesDetailComponent },
				],
			},
			// Index of the embedding guests, reached from the Home callout (not the
			// navbar). It lists the guest routes and links out to their source; the
			// guests themselves render chromeless under GuestLayout above.
			{
				path: 'embedding',
				component: EmbeddingComponent,
			},
			{
				path: '**',
				component: NotFoundComponent,
			},
		],
	},
];
