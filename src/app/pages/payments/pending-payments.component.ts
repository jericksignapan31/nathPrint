import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { PaymentsService } from '@/app/services/payments.service';
import { UserService } from '@/app/services/user.service';
import { Payment } from '@/app/models';

@Component({
    selector: 'app-pending-payments',
    standalone: true,
    imports: [CommonModule, RouterModule, CardModule, ButtonModule, TagModule, TableModule, TooltipModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="card">
            <p-card header="Pending Payments" styleClass="mb-0">
                <p-table [value]="pendingPayments" [rows]="10" [paginator]="true" responsiveLayout="scroll">
                    <ng-template pTemplate="header">
                        <tr>
                            <th pSortableColumn="referenceNo">Reference No. <p-sortIcon field="referenceNo"></p-sortIcon></th>
                            <th pSortableColumn="amount">Amount <p-sortIcon field="amount"></p-sortIcon></th>
                            <th>Payment Method</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-payment>
                        <tr>
                            <td class="font-mono text-sm">{{ payment.referenceNo || 'N/A' }}</td>
                            <td class="font-semibold">₱{{ payment.amount | number: '1.2-2' }}</td>
                            <td class="capitalize">{{ payment.paymentMethod }}</td>
                            <td>
                                <p-tag [value]="payment.status | uppercase" severity="warn"></p-tag>
                            </td>
                            <td>
                                <p-button icon="pi pi-info-circle" [rounded]="true" [text]="true" pTooltip="View Details" tooltipPosition="top"></p-button>
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="5">
                                <div class="flex flex-col items-center justify-center py-12 text-center">
                                    <i class="pi pi-check-circle text-4xl text-gray-300 mb-4"></i>
                                    <p class="text-sm text-gray-400 mb-6">You don't have any pending payments at the moment.</p>
                                </div>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </p-card>
        </div>
    `
})
export class PendingPaymentsComponent implements OnInit {
    private paymentsService = inject(PaymentsService);
    private userService = inject(UserService);

    pendingPayments: Payment[] = [];

    ngOnInit() {
        this.loadPendingPayments();
    }

    loadPendingPayments() {
        this.userService.getCurrentUserData().subscribe((user) => {
            if (user?.uid) {
                this.paymentsService.getUserPayments(user.uid).subscribe({
                    next: (payments: Payment[]) => {
                        this.pendingPayments = payments.filter((p) => p.status === 'pending');
                    },
                    error: (err: any) => {
                        console.error('Failed to load pending payments:', err);
                    }
                });
            }
        });
    }
}
