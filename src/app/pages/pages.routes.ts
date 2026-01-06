import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { NewOrderComponent } from './orders/new-order.component';
import { OrdersListComponent } from './orders/orders-list.component';
import { OrderDetailComponent } from './orders/order-detail.component';

export default [
    { path: 'documentation', component: Documentation },
    { path: 'crud', component: Crud },
    { path: 'empty', component: Empty },
    { path: 'orders', component: OrdersListComponent },
    { path: 'orders/new', component: NewOrderComponent },
    { path: 'orders/:id', component: OrderDetailComponent },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
