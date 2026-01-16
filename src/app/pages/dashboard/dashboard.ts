import { Component } from '@angular/core';
import { CustomerOverviewComponent } from './components/customer-overview.component';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CustomerOverviewComponent],
    template: ` <app-customer-overview /> `
})
export class Dashboard {}
