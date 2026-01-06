import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-new-order',
    standalone: true,
    imports: [CommonModule, RouterModule, CardModule, ButtonModule],
    template: `
        <div class="card">
            <h2 class="text-3xl font-bold mb-3">Create New Order</h2>
            <p class="text-muted-color mb-4">Under construction. Order form will be available soon.</p>
            <p-button label="Back to Dashboard" icon="pi pi-home" [routerLink]="['/dashboard']"></p-button>
        </div>
    `
})
export class NewOrderComponent {}
