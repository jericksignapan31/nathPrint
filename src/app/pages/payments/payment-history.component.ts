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
    selector: 'app-payment-history',
    standalone: true,
    imports: [CommonModule, RouterModule, CardModule, ButtonModule, TagModule, TableModule, TooltipModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="card">
            <p-card header="Payment History" styleClass="mb-0">
                <p-table [value]="paymentHistory" [rows]="10" [paginator]="true" responsiveLayout="scroll" [globalFilterFields]="['referenceNo']">
                    <ng-template pTemplate="header">
                        <tr>
                            <th pSortableColumn="referenceNo">Reference No. <p-sortIcon field="referenceNo"></p-sortIcon></th>
                            <th pSortableColumn="amount">Amount <p-sortIcon field="amount"></p-sortIcon></th>
                            <th>Payment Method</th>
                            <th pSortableColumn="status">Status <p-sortIcon field="status"></p-sortIcon></th>
                            <th>Receipt</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-payment>
                        <tr>
                            <td class="font-mono text-sm">{{ payment.referenceNo || 'N/A' }}</td>
                            <td class="font-semibold">₱{{ payment.amount | number: '1.2-2' }}</td>
                            <td class="capitalize">{{ payment.paymentMethod }}</td>
                            <td>
                                <p-tag [value]="payment.status | uppercase" [severity]="getPaymentStatusSeverity(payment.status)"></p-tag>
                            </td>
                            <td>
                                <a
                                    *ngIf="payment.receiptUrl"
                                    [href]="payment.receiptUrl"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="inline-flex items-center justify-center w-8 h-8 rounded-full text-primary hover:bg-primary-50 transition-colors"
                                    [pTooltip]="'View Receipt'"
                                    tooltipPosition="top"
                                >
                                    <i class="pi pi-external-link"></i>
                                </a>
                                <span *ngIf="!payment.receiptUrl" class="text-gray-400">N/A</span>
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="5">
                                <div class="flex flex-col items-center justify-center py-12 text-center">
                                    <i class="pi pi-credit-card text-4xl text-gray-300 mb-4"></i>
                                    <p class="text-lg font-semibold text-gray-600 mb-2">No Payments Yet</p>
                                    <p class="text-sm text-gray-400 mb-6">You haven't made any payments yet.</p>
                                </div>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </p-card>
        </div>
    `
})
export class PaymentHistoryComponent implements OnInit {
    private paymentsService = inject(PaymentsService);
    private userService = inject(UserService);

    paymentHistory: Payment[] = [];

    ngOnInit() {
        this.loadPaymentHistory();
    }

    loadPaymentHistory() {
        this.userService.getCurrentUserData().subscribe((user) => {
            if (user?.uid) {
                this.paymentsService.getUserPayments(user.uid).subscribe({
                    next: (payments: Payment[]) => {
                        this.paymentHistory = payments;
                    },
                    error: (err: any) => {
                        console.error('Failed to load payment history:', err);
                    }
                });
            }
        });
    }

    getPaymentStatusSeverity(status: string): 'success' | 'warn' | 'danger' {
        switch (status) {
            case 'paid':
                return 'success';
            case 'pending':
                return 'warn';
            case 'unpaid':
                return 'danger';
            default:
                return 'warn';
        }
    }
}
