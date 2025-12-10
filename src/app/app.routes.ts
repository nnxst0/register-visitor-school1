import { Routes } from '@angular/router';
import { RegisterComponent } from './register/register';
import { DatatableComponent } from './datatable/datatable';
import { ReturnCardComponent } from './return-card/return-card';


export const routes: Routes = [
  { path: '', redirectTo: 'register', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
  { path: 'datatable', component: DatatableComponent },
  { path: 'return-card', component: ReturnCardComponent },

];