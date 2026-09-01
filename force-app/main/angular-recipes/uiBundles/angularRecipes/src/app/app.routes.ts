import { Routes } from '@angular/router';
import { AppLayoutComponent } from './components/layout/app-layout/app-layout';
import { HomeComponent } from './pages/home/home';
import { HelloComponent } from './pages/hello/hello';
import { StylingComponent } from './pages/styling/styling';
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
				path: 'styling',
				component: StylingComponent,
				data: { showInNavigation: true, label: 'Styling' },
			},
			{
				path: '**',
				component: NotFoundComponent,
			},
		],
	},
];
