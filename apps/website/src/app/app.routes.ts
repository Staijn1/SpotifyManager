import { Route } from '@angular/router';
import { GetStartedComponent } from './pages/get-started/get-started/get-started.component';
import { AuthorizeComponent } from './pages/authorize/authorize.component';
import { AccountPageComponent } from './pages/account/account-page.component';

export const appRoutes: Route[] = [
  { path: 'get-started', component: GetStartedComponent },
  { path: 'callback', component: AuthorizeComponent },
  { path: 'account', component: AccountPageComponent}
];
