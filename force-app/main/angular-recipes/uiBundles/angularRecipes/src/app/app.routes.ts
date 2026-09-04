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

export const routes: Routes = [
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
			{
				path: '**',
				component: NotFoundComponent,
			},
		],
	},
];
