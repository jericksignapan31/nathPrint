import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectButtonModule } from 'primeng/selectbutton';

@Component({
    selector: 'app-new-order',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, CardModule, ButtonModule, InputTextModule, InputNumberModule, TextareaModule, SelectModule, DatePickerModule, SelectButtonModule],
    styles: [
        `
            ::ng-deep .p-selectbutton .p-button {
                transition: all 0.2s;
            }
            ::ng-deep .p-selectbutton .p-button:hover:not(.p-highlight) {
                background-color: var(--surface-hover);
            }
        `
    ],
    template: `
        <div class="card">
            <p-card header="Upload document (PDF/DOC/DOCX)" styleClass="mb-4">
                <div class="surface-border border-2 border-dashed border-round p-4 text-center" [ngClass]="{ 'border-primary border-3': isDragOver }" (dragover)="onDragOver($event)" (dragleave)="onDragLeave($event)" (drop)="onFileDrop($event)">
                    <p class="font-semibold mb-2">Drag & drop files here</p>
                    <p class="text-sm text-muted-color mb-3">Accepts PDF, DOC, DOCX</p>
                    <input #fileInput type="file" multiple accept=".pdf,.doc,.docx" class="hidden" (change)="onFileSelect($event)" />
                    <p-button label="Choose Files" icon="pi pi-upload" (onClick)="fileInput.click()"></p-button>
                </div>

                <div class="mt-3" *ngIf="uploads.length > 0">
                    <p class="text-sm text-muted-color mb-2">Selected files:</p>
                    <ul class="m-0 pl-3 list-disc">
                        <li *ngFor="let f of uploads" class="flex align-items-center gap-2 mb-1">
                            <span class="font-medium">{{ f.name }}</span>
                            <span class="text-sm text-muted-color">({{ formatSize(f.size) }})</span>
                            <p-button icon="pi pi-times" text rounded severity="danger" (onClick)="removeFile(f.name)"></p-button>
                        </li>
                    </ul>
                </div>

                <div class="grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2rem; min-height: 500px;">
                    <div>
                        <p-card header="Print Options" [ngStyle]="{ height: '100%', padding: '1.5rem' }">
                            <div class="field mb-3">
                                <label class="font-semibold block mb-2">Preferred Pickup Date & Time (Optional)</label>
                                <p-datepicker [(ngModel)]="pickupDateTime" [showTime]="true" [showIcon]="true" placeholder="Select date and time" styleClass="w-full" hourFormat="12"></p-datepicker>
                            </div>
                            <div class="field mb-3">
                                <label class="font-semibold block mb-2">Paper Size</label>
                                <p-selectbutton [options]="paperSizes" [(ngModel)]="paperSize" optionLabel="label" optionValue="value" styleClass="w-full" style="gap: 0.5rem; display: flex;"></p-selectbutton>
                            </div>
                            <div class="field mb-3">
                                <label class="font-semibold block mb-2">Color Mode</label>
                                <p-selectbutton [options]="colorModes" [(ngModel)]="colorMode" optionLabel="label" optionValue="value" styleClass="w-full" style="gap: 0.5rem; display: flex;"></p-selectbutton>
                            </div>
                            <div class="field mb-3">
                                <label class="font-semibold block mb-2">Paper Type</label>
                                <p-selectbutton [options]="paperTypes" [(ngModel)]="paperType" optionLabel="label" optionValue="value" styleClass="w-full" style="gap: 0.5rem; display: flex;"></p-selectbutton>
                            </div>
                            <div class="field mb-3">
                                <label class="font-semibold block mb-2">Copies</label>
                                <p-inputNumber class="w-full" [(ngModel)]="copies" [min]="1" [max]="1000"></p-inputNumber>
                            </div>
                            <div class="field mb-3">
                                <label class="font-semibold block mb-2">Note</label>
                                <textarea pInputTextarea [(ngModel)]="note" rows="4" class="w-full" placeholder="Add any special instructions or notes..."></textarea>
                            </div>
                        </p-card>
                    </div>

                    <div>
                        <p-card header="Payments" [ngStyle]="{ height: '100%', padding: '1.5rem' }">
                            <div class="bg-surface-50 border-round p-4 mb-4 border-1 border-primary-200">
                                <div class="text-center mb-3">
                                    <p class="text-primary font-semibold text-lg mb-3">Estimated Total</p>
                                    <div class="bg-white border-2 border-primary border-round p-3 mb-3">
                                        <p class="text-5xl font-bold text-primary m-0">{{ paymentAmount || 0 | currency: 'PHP' : 'symbol' : '1.2-2' }}</p>
                                    </div>
                                </div>
                                <div class="text-sm text-muted-color">
                                    <p class="flex align-items-center gap-2 mb-2 m-0">
                                        <i class="pi pi-info-circle text-blue-500"></i>
                                        <span>If the total amount is zero, prices have not yet been set by the printshop.</span>
                                    </p>
                                    <p class="flex align-items-center gap-2 m-0">
                                        <i class="pi pi-exclamation-circle text-red-500"></i>
                                        <span><strong>This is an estimate.</strong> Final cost will be confirmed at the shop.</span>
                                    </p>
                                </div>
                            </div>
                            <div class="field mb-3">
                                <label class="font-semibold block mb-2">Payment Method</label>
                                <p-selectbutton [options]="paymentMethods" [(ngModel)]="paymentMethod" optionLabel="label" optionValue="value" styleClass="w-full" style="gap: 0.5rem; display: flex;"></p-selectbutton>
                            </div>
                            <div class="field mb-3" *ngIf="paymentMethod === 'gcash'">
                                <div class="bg-surface-section p-4 border-round text-center">
                                    <p class="text-sm text-muted-color mb-3">GCash QR Code</p>
                                    <div class="bg-white p-3 border-round" style="display: inline-block;">
                                        <img src="https://ph-live-01.slatic.net/p/431d72655ec8a91a622bf6bf445b9c95.jpg" alt="GCash QR Code" style="width: 200px; height: 200px; object-fit: contain;" />
                                    </div>
                                </div>
                            </div>
                            <div class="field mb-3" *ngIf="paymentMethod === 'gcash'">
                                <label class="font-semibold block mb-2">Reference No. (optional)</label>
                                <input pInputText class="w-full" [(ngModel)]="paymentReference" placeholder="e.g., GCash ref or receipt ID" />
                            </div>
                            <div class="field mb-3" *ngIf="paymentMethod === 'gcash'">
                                <label class="font-semibold block mb-2">Receipt Upload (optional)</label>
                                <div class="surface-border border-2 border-dashed border-round p-3 text-center">
                                    <input #receiptInput type="file" accept=".pdf,.jpg,.jpeg,.png" class="hidden" (change)="onReceiptSelect($event)" />
                                    <p-button label="Upload Receipt" icon="pi pi-upload" size="small" (onClick)="receiptInput.click()" [disabled]="!paymentReference"></p-button>
                                    <p *ngIf="receiptFile" class="text-sm text-muted-color mt-2 mb-0">{{ receiptFile.name }} ({{ formatSize(receiptFile.size) }})</p>
                                </div>
                            </div>
                            <div class="field mb-3">
                                <label class="font-semibold block mb-2">Amount</label>
                                <p-inputNumber class="w-full" [(ngModel)]="paymentAmount" mode="currency" currency="PHP" locale="en-PH"></p-inputNumber>
                            </div>
                        </p-card>
                    </div>
                </div>

                <div style="margin-top: 2rem; display: flex; gap: 0.5rem; justify-content: space-between;">
                    <p-button label="Cancel" severity="secondary" icon="pi pi-times" (onClick)="onCancel()"></p-button>
                    <p-button label="Submit Order" severity="success" icon="pi pi-check" (onClick)="onSubmit()"></p-button>
                </div>
            </p-card>
        </div>
    `
})
export class NewOrderComponent {
    isDragOver = false;
    uploads: { name: string; size: number; file: File }[] = [];

    paymentMethods = [
        { label: 'GCash', value: 'gcash' },
        { label: 'Pay on Shop', value: 'pay_on_shop' }
    ];
    paymentMethod: string | null = null;
    paymentReference = '';
    paymentAmount: number | null = null;
    receiptFile: File | null = null;

    paperSizes = [
        { label: 'A4', value: 'A4' },
        { label: 'Letter', value: 'Letter' },
        { label: 'Legal', value: 'Legal' },
        { label: 'A3', value: 'A3' }
    ];
    colorModes = [
        { label: 'Black & White', value: 'bw' },
        { label: 'Color', value: 'color' }
    ];
    paperTypes = [
        { label: 'Bond', value: 'bond' },
        { label: 'Glossy', value: 'glossy' },
        { label: 'Matte', value: 'matte' }
    ];
    paperSize: string | null = null;
    colorMode: string | null = null;
    paperType: string | null = null;
    copies = 1;
    note = '';
    pickupDateTime: Date | null = null;
    onDragOver(event: DragEvent) {
        event.preventDefault();
        this.isDragOver = true;
    }

    onDragLeave(event: DragEvent) {
        event.preventDefault();
        this.isDragOver = false;
    }

    onFileDrop(event: DragEvent) {
        event.preventDefault();
        this.isDragOver = false;
        if (!event.dataTransfer?.files) return;
        this.addFiles(event.dataTransfer.files);
    }

    onFileSelect(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files) return;
        this.addFiles(input.files);
        input.value = '';
    }

    addFiles(fileList: FileList) {
        const allowedExt = ['pdf', 'doc', 'docx'];
        Array.from(fileList).forEach((file) => {
            const ext = file.name.split('.').pop()?.toLowerCase();
            if (!ext || !allowedExt.includes(ext)) {
                return;
            }
            this.uploads.push({ name: file.name, size: file.size, file });
        });
    }

    removeFile(name: string) {
        this.uploads = this.uploads.filter((f) => f.name !== name);
    }

    formatSize(bytes: number): string {
        if (bytes < 1024) return `${bytes} B`;
        const kb = bytes / 1024;
        if (kb < 1024) return `${kb.toFixed(1)} KB`;
        const mb = kb / 1024;
        return `${mb.toFixed(1)} MB`;
    }

    onReceiptSelect(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files) return;
        const file = input.files[0];
        const allowedExt = ['pdf', 'jpg', 'jpeg', 'png'];
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext && allowedExt.includes(ext)) {
            this.receiptFile = file;
        }
        input.value = '';
    }

    onSubmit() {
        // TODO: Implement order submission logic
        console.log('Submitting order...', {
            uploads: this.uploads,
            pickupDateTime: this.pickupDateTime,
            paperSize: this.paperSize,
            colorMode: this.colorMode,
            paperType: this.paperType,
            copies: this.copies,
            note: this.note,
            paymentMethod: this.paymentMethod,
            paymentReference: this.paymentReference,
            paymentAmount: this.paymentAmount,
            receiptFile: this.receiptFile
        });
    }

    onCancel() {
        // TODO: Implement cancel logic with confirmation
        if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
            // Reset form or navigate back
            console.log('Order cancelled');
        }
    }
}
