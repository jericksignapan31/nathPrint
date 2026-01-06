import { Component, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<ul class="layout-menu">
        @for (item of model; track $index) {
            @if (!item.separator) {
                <li app-menuitem [item]="item" [root]="true"></li>
            } @else {
                <li class="menu-separator"></li>
            }
        }
    </ul> `
})
export class AppMenu {
    model: MenuItem[] = [];

    constructor(
        private userService: UserService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        // Listen to user role changes
        this.userService.getUserRole().subscribe((role) => {
            this.buildMenu(role);
        });
    }

    buildMenu(role: string) {
        if (role === 'admin') {
            // Admin sees admin menu only
            this.model = this.getAdminMenu();
        } else {
            this.model = this.getCustomerMenu();
        }
        this.cdr.markForCheck();
    }

    getCustomerMenu(): MenuItem[] {
        return [
            {
                label: 'Dashboard',
                items: [
                    {
                        label: 'Overview',
                        icon: 'pi pi-fw pi-home',
                        routerLink: ['/dashboard']
                    }
                ]
            },
            {
                label: 'Orders',
                icon: 'pi pi-fw pi-file',
                items: [
                    {
                        label: 'New Order',
                        icon: 'pi pi-fw pi-plus-circle',
                        routerLink: ['/pages/orders/new']
                    },
                    {
                        label: 'My Orders',
                        icon: 'pi pi-fw pi-list',
                        routerLink: ['/pages/orders']
                    },
                    {
                        label: 'Order History',
                        icon: 'pi pi-fw pi-history',
                        routerLink: ['/pages/orders/history']
                    }
                ]
            },
            {
                label: 'Payments',
                icon: 'pi pi-fw pi-wallet',
                items: [
                    {
                        label: 'Pending Payments',
                        icon: 'pi pi-fw pi-clock',
                        routerLink: ['/pages/payments/pending']
                    },
                    {
                        label: 'Payment History',
                        icon: 'pi pi-fw pi-credit-card',
                        routerLink: ['/pages/payments/history']
                    }
                ]
            },
            {
                label: 'Services',
                icon: 'pi pi-fw pi-box',
                items: [
                    {
                        label: 'View Services',
                        icon: 'pi pi-fw pi-eye',
                        routerLink: ['/pages/services/view']
                    },
                    {
                        label: 'Pricing',
                        icon: 'pi pi-fw pi-dollar',
                        routerLink: ['/pages/services/pricing']
                    }
                ]
            },
            { separator: true },
            {
                label: 'Account',
                icon: 'pi pi-fw pi-user',
                items: [
                    {
                        label: 'Profile',
                        icon: 'pi pi-fw pi-user-edit',
                        routerLink: ['/pages/profile']
                    },
                    {
                        label: 'Settings',
                        icon: 'pi pi-fw pi-cog',
                        routerLink: ['/pages/settings']
                    }
                ]
            }
        ];
    }

    getAdminMenu(): MenuItem[] {
        return [
            {
                label: 'Dashboard',
                items: [
                    {
                        label: 'Statistics',
                        icon: 'pi pi-fw pi-chart-bar',
                        routerLink: ['/dashboard']
                    },
                    {
                        label: "Today's Orders",
                        icon: 'pi pi-fw pi-calendar-clock',
                        routerLink: ['/pages/admin/dashboard/today']
                    }
                ]
            },
            {
                label: 'Order Management',
                icon: 'pi pi-fw pi-file',
                items: [
                    {
                        label: 'All Orders',
                        icon: 'pi pi-fw pi-list',
                        routerLink: ['/pages/admin/orders/all']
                    },
                    {
                        label: 'Pending Orders',
                        icon: 'pi pi-fw pi-clock',
                        routerLink: ['/pages/admin/orders/pending']
                    },
                    {
                        label: 'In Progress',
                        icon: 'pi pi-fw pi-spin pi-spinner',
                        routerLink: ['/pages/admin/orders/progress']
                    },
                    {
                        label: 'Completed',
                        icon: 'pi pi-fw pi-check-circle',
                        routerLink: ['/pages/admin/orders/completed']
                    }
                ]
            },
            {
                label: 'Service Management',
                icon: 'pi pi-fw pi-box',
                items: [
                    {
                        label: 'Services List',
                        icon: 'pi pi-fw pi-list',
                        routerLink: ['/admin/services/list']
                    },
                    {
                        label: 'Add Service',
                        icon: 'pi pi-fw pi-plus',
                        routerLink: ['/admin/services/add']
                    },
                    {
                        label: 'Edit Pricing',
                        icon: 'pi pi-fw pi-dollar',
                        routerLink: ['/admin/services/pricing']
                    }
                ]
            },
            {
                label: 'Payment Management',
                icon: 'pi pi-fw pi-wallet',
                items: [
                    {
                        label: 'Pending Verification',
                        icon: 'pi pi-fw pi-exclamation-circle',
                        routerLink: ['/admin/payments/pending']
                    },
                    {
                        label: 'Verified Payments',
                        icon: 'pi pi-fw pi-check',
                        routerLink: ['/admin/payments/verified']
                    },
                    {
                        label: 'Payment History',
                        icon: 'pi pi-fw pi-history',
                        routerLink: ['/admin/payments/history']
                    }
                ]
            },
            {
                label: 'User Management',
                icon: 'pi pi-fw pi-users',
                items: [
                    {
                        label: 'All Users',
                        icon: 'pi pi-fw pi-users',
                        routerLink: ['/admin/users/all']
                    },
                    {
                        label: 'Customer List',
                        icon: 'pi pi-fw pi-user',
                        routerLink: ['/admin/users/customers']
                    }
                ]
            },
            {
                label: 'Reports',
                icon: 'pi pi-fw pi-chart-line',
                items: [
                    {
                        label: 'Sales Report',
                        icon: 'pi pi-fw pi-chart-bar',
                        routerLink: ['/admin/reports/sales']
                    },
                    {
                        label: 'Order Analytics',
                        icon: 'pi pi-fw pi-chart-pie',
                        routerLink: ['/admin/reports/analytics']
                    }
                ]
            },
            { separator: true },
            {
                label: 'Account',
                icon: 'pi pi-fw pi-user',
                items: [
                    {
                        label: 'Profile',
                        icon: 'pi pi-fw pi-user-edit',
                        routerLink: ['/pages/profile']
                    },
                    {
                        label: 'Settings',
                        icon: 'pi pi-fw pi-cog',
                        routerLink: ['/pages/settings']
                    }
                ]
            }
        ];
    }
}
