import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';

import { OrdersService } from '../../services/orders.service';
import { ServicesService } from '../../services/services.service';
import { FirebaseService } from '../../services/firebase.service';
import { Service, PrintOptions, OrderStatus, PaymentStatus } from '../../models';

@Component({
    selector: 'app-new-order',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, CardModule, SelectModule, InputNumberModule, InputTextModule, TextareaModule, RadioButtonModule, MessageModule, DividerModule],
    template: `
        <div class="card">
            <h2 class="text-3xl font-bold mb-4">Create New Order</h2>

            @if (errorMessage) {
                <p-message severity="error" [text]="errorMessage" styleClass="mb-4 w-full"></p-message>
            }
            @if (successMessage) {
                <p-message severity="success" [text]="successMessage" styleClass="mb-4 w-full"></p-message>
            }

            <div class="grid">
                <div class="col-12 md:col-8">
                    <p-card header="Order Details">
                        <!-- Service Selection -->
                        <div class="field mb-4">
                            <label for="service" class="font-semibold block mb-2">Select Service *</label>
                            <p-select id="service" [options]="services" [(ngModel)]="selectedService" optionLabel="name" placeholder="Choose a service" styleClass="w-full" (onChange)="onServiceChange()"> </p-select>
                        </div>

                        @if (selectedService) {
                            <div class="bg-primary-50 dark:bg-primary-900 p-3 border-round mb-4">
                                <p class="text-sm m-0">{{ selectedService.description }}</p>
                            </div>

                            <p-divider></p-divider>

                            <!-- Print Options (for printing service) -->
                            @if (selectedService.name.toLowerCase().includes('print')) {
                                <h3 class="text-xl font-semibold mb-3">Print Configuration</h3>

                                <div class="grid">
                                    <!-- Paper Size -->
                                    <div class="col-12 md:col-6 field">
                                        <label class="font-semibold block mb-2">Paper Size *</label>
                                        <p-select [options]="paperSizes" [(ngModel)]="printOptions.paperSize" placeholder="Select size" styleClass="w-full" (onChange)="calculateTotal()"> </p-select>
                                    </div>

                                    <!-- Color Mode -->
                                    <div class="col-12 md:col-6 field">
                                        <label class="font-semibold block mb-2">Color Mode *</label>
                                        <div class="flex gap-4">
                                            <div class="flex align-items-center">
                                                <p-radioButton name="colorMode" value="bw" [(ngModel)]="printOptions.colorMode" inputId="bw" (onClick)="calculateTotal()"> </p-radioButton>
                                                <label for="bw" class="ml-2">Black & White</label>
                                            </div>
                                            <div class="flex align-items-center">
                                                <p-radioButton name="colorMode" value="color" [(ngModel)]="printOptions.colorMode" inputId="color" (onClick)="calculateTotal()"> </p-radioButton>
                                                <label for="color" class="ml-2">Color</label>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Copies -->
                                    <div class="col-12 md:col-6 field">
                                        <label class="font-semibold block mb-2">Number of Copies *</label>
                                        <p-inputNumber [(ngModel)]="printOptions.copies" [min]="1" [max]="1000" styleClass="w-full" (onInput)="calculateTotal()"> </p-inputNumber>
                                    </div>

                                    <!-- Orientation -->
                                    <div class="col-12 md:col-6 field">
                                        <label class="font-semibold block mb-2">Orientation *</label>
                                        <p-select [options]="orientations" [(ngModel)]="printOptions.orientation" placeholder="Select orientation" styleClass="w-full"> </p-select>
                                    </div>

                                    <!-- Paper Type -->
                                    <div class="col-12 field">
                                        <label class="font-semibold block mb-2">Paper Type *</label>
                                        <p-select [options]="paperTypes" [(ngModel)]="printOptions.paperType" placeholder="Select paper type" styleClass="w-full" (onChange)="calculateTotal()"> </p-select>
                                    </div>
                                </div>
                            }

                            <!-- Additional Notes -->
                            <div class="field mt-4">
                                <label class="font-semibold block mb-2">Additional Notes (Optional)</label>
                                <textarea pTextarea [(ngModel)]="notes" rows="4" class="w-full" placeholder="Any special instructions or requirements..."> </textarea>
                            </div>
                        }
                    </p-card>
                </div>

                <!-- Order Summary -->
                <div class="col-12 md:col-4">
                    <p-card header="Order Summary" styleClass="sticky top-0">
                        @if (selectedService) {
                            <div class="mb-3">
                                <p class="text-muted-color text-sm mb-1">Service</p>
                                <p class="font-semibold">{{ selectedService.name }}</p>
                            </div>

                            @if (selectedService.name.toLowerCase().includes('print')) {
                                <div class="mb-3">
                                    <p class="text-muted-color text-sm mb-1">Configuration</p>
                                    <p class="text-sm">{{ printOptions.paperSize }} - {{ printOptions.colorMode === 'bw' ? 'B&W' : 'Color' }}</p>
                                    <p class="text-sm">{{ printOptions.copies }} copies - {{ printOptions.orientation }}</p>
                                    <p class="text-sm">Paper: {{ printOptions.paperType }}</p>
                                </div>
                            }

                            <p-divider></p-divider>

                            <div class="mb-3">
                                <div class="flex justify-content-between mb-2">
                                    <span class="text-muted-color">Base Price:</span>
                                    <span>₱{{ selectedService.basePrice }}</span>
                                </div>
                                @if (selectedService.pricePerPage > 0) {
                                    <div class="flex justify-content-between mb-2">
                                        <span class="text-muted-color">Per Page:</span>
                                        <span>₱{{ selectedService.pricePerPage }} × {{ printOptions.copies }}</span>
                                    </div>
                                }
                            </div>

                            <p-divider></p-divider>

                            <div class="flex justify-content-between align-items-center mb-4">
                                <span class="text-xl font-bold">Total:</span>
                                <span class="text-2xl font-bold text-primary">₱{{ estimatedTotal }}</span>
                            </div>

                            <p-button label="Place Order" icon="pi pi-check" styleClass="w-full" [loading]="loading" (onClick)="submitOrder()"> </p-button>
                        } @else {
                            <p class="text-muted-color text-center">Please select a service to see pricing</p>
                        }
                    </p-card>
                </div>
            </div>
        </div>
    `
})
export class NewOrderComponent implements OnInit {
    services: Service[] = [];
    selectedService: Service | null = null;

    printOptions: PrintOptions = {
        paperSize: 'A4',
        colorMode: 'bw',
        copies: 1,
        orientation: 'portrait',
        paperType: 'bond'
    };

    notes: string = '';
    estimatedTotal: number = 0;
    loading: boolean = false;
    errorMessage: string = '';
    successMessage: string = '';

    paperSizes = ['A4', 'Letter', 'Legal', 'A3'];
    orientations = ['portrait', 'landscape'];
    paperTypes = ['bond', 'glossy', 'photo'];

    constructor(
        private servicesService: ServicesService,
        private ordersService: OrdersService,
        private firebaseService: FirebaseService,
        private router: Router
    ) {}

    ngOnInit() {
        this.loadServices();
    }

    loadServices() {
        this.servicesService.getActiveServices().subscribe({
            next: (services) => {
                this.services = services;
            },
            error: (error) => {
                this.errorMessage = 'Failed to load services. Please refresh the page.';
                console.error('Error loading services:', error);
            }
        });
    }

    onServiceChange() {
        this.calculateTotal();
    }

    calculateTotal() {
        if (!this.selectedService) {
            this.estimatedTotal = 0;
            return;
        }

        let total = this.selectedService.basePrice;

        if (this.selectedService.pricePerPage > 0) {
            total += this.selectedService.pricePerPage * this.printOptions.copies;
        }

        // Additional charges for color printing
        if (this.printOptions.colorMode === 'color') {
            total += this.printOptions.copies * 2; // ₱2 extra per page for color
        }

        // Additional charges for special paper
        if (this.printOptions.paperType === 'glossy') {
            total += this.printOptions.copies * 3;
        } else if (this.printOptions.paperType === 'photo') {
            total += this.printOptions.copies * 5;
        }

        this.estimatedTotal = total;
    }

    submitOrder() {
        if (!this.selectedService) {
            this.errorMessage = 'Please select a service';
            return;
        }

        const currentUser = this.firebaseService.currentUserValue;
        if (!currentUser) {
            this.errorMessage = 'You must be logged in to place an order';
            this.router.navigate(['/auth/login']);
            return;
        }

        this.loading = true;
        this.errorMessage = '';
        this.successMessage = '';

        const orderData = {
            userId: currentUser.uid,
            serviceId: this.selectedService.serviceId,
            status: 'pending' as OrderStatus,
            totalAmount: this.estimatedTotal,
            printOptions: this.printOptions,
            paymentStatus: 'unpaid' as PaymentStatus
        };

        this.ordersService.createOrder(orderData).subscribe({
            next: (orderId) => {
                this.loading = false;
                this.successMessage = 'Order placed successfully! Redirecting...';
                setTimeout(() => {
                    this.router.navigate(['/pages/orders', orderId]);
                }, 2000);
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = 'Failed to place order. Please try again.';
                console.error('Error creating order:', error);
            }
        });
    }
}
