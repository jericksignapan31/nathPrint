import { Component, inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { OrdersService } from '@/app/services/orders.service';
import { Order, OrderStatus } from '@/app/models';

@Component({
    selector: 'app-orders-list',
    standalone: true,
    imports: [CommonModule, RouterModule, TableModule, ButtonModule, InputTextModule, TagModule, CardModule, FormsModule, TooltipModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="card">
            <p-card header="My Orders" styleClass="mb-0">
                <div class="mb-4 flex gap-2">
                    <input pInputText type="text" placeholder="Search orders..." [(ngModel)]="searchValue" (input)="filterOrders()" class="flex-1" />
                    <p-button label="Create Order" icon="pi pi-plus" routerLink="/pages/orders/new"></p-button>
                </div>

                <p-table [value]="filteredOrders" [rows]="10" [paginator]="true" responsiveLayout="scroll" [globalFilterFields]="['orderId', 'status']" styleClass="p-datatable-striped">
                    <ng-template pTemplate="header">
                        <tr>
                            <th pSortableColumn="orderId">Order ID <p-sortIcon field="orderId"></p-sortIcon></th>
                            <th pSortableColumn="createdAt">Date <p-sortIcon field="createdAt"></p-sortIcon></th>
                            <th>Items</th>
                            <th>Total</th>
                            <th pSortableColumn="status">Status <p-sortIcon field="status"></p-sortIcon></th>
                            <th>Actions</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-order>
                        <tr>
                            <td class="font-semibold">{{ order.orderId }}</td>
                            <td>{{ order.createdAt | date: 'MMM dd, yyyy HH:mm' }}</td>
                            <td>
                                <span class="text-sm"> {{ order.printOptions.pages }} page(s) × {{ order.printOptions.copies }} copies </span>
                            </td>
                            <td class="font-semibold">₱{{ order.totalAmount | number: '1.2-2' }}</td>
                            <td>
                                <p-tag [value]="order.status" [severity]="getStatusSeverity(order.status)"></p-tag>
                            </td>
                            <td>
                                <p-button icon="pi pi-eye" [rounded]="true" [text]="true" [routerLink]="['/pages/orders', order.orderId]" pTooltip="View Details" tooltipPosition="top"></p-button>
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="6" class="text-center py-4">
                                <p class="text-muted-color">No orders found. <a routerLink="/pages/orders/new" class="text-primary font-semibold">Create one now!</a></p>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </p-card>
        </div>
    `
})
export class OrdersListComponent implements OnInit {
    ordersService = inject(OrdersService);
    cdr = inject(ChangeDetectorRef);
    orders: Order[] = [];
    filteredOrders: Order[] = [];
    searchValue: string = '';

    ngOnInit() {
        this.loadOrders();
    }

    loadOrders() {
        this.ordersService.getAllOrders().subscribe({
            next: (orders) => {
                console.log('Orders loaded:', orders);
                this.orders = orders;
                this.filterOrders();
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Failed to load orders', err);
            }
        });
    }

    filterOrders() {
        if (!this.searchValue.trim()) {
            this.filteredOrders = this.orders;
        } else {
            const search = this.searchValue.toLowerCase();
            this.filteredOrders = this.orders.filter((o) => o.orderId.toLowerCase().includes(search) || o.status.toLowerCase().includes(search));
        }
        this.cdr.markForCheck();
    }

    getStatusSeverity(status: OrderStatus): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
        switch (status) {
            case 'pending':
                return 'warn';
            case 'processing':
                return 'info';
            case 'ready':
                return 'success';
            case 'completed':
                return 'success';
            case 'cancelled':
                return 'danger';
            default:
                return 'secondary';
        }
    }
}
