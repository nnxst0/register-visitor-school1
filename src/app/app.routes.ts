import { Routes } from '@angular/router';
import { RegisterComponent } from './register/register';
import { DatatableComponent } from './datatable/datatable';


export const routes: Routes = [
  { path: '', redirectTo: 'register', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
  { path: 'datatable', component: DatatableComponent },

];