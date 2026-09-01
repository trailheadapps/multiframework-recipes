import { Routes } from '@angular/router';
import { AppLayoutComponent } from './components/layout/app-layout/app-layout';
import { HomeComponent } from './pages/home/home';
import { HelloComponent } from './pages/hello/hello';
import { ReadDataComponent } from './pages/read-data/read-data';
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
				path: '**',
				component: NotFoundComponent,
			},
		],
	},
];
