import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { NewOrderComponent } from './orders/new-order.component';

export default [
    { path: 'documentation', component: Documentation },
    { path: 'crud', component: Crud },
    { path: 'empty', component: Empty },
    { path: 'orders/new', component: NewOrderComponent },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
