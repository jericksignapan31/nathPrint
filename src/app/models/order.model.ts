export type OrderStatus = 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'pending' | 'paid';
export type ColorMode = 'bw' | 'color';
export type Orientation = 'portrait' | 'landscape';

export interface PrintOptions {
    paperSize: string; // 'A4', 'Letter', 'Legal'
    colorMode: ColorMode;
    copies: number;
    orientation: Orientation;
    paperType: string; // 'bond', 'glossy'
}

export interface Order {
    orderId: string;
    userId: string;
    serviceId: string;
    status: OrderStatus;
    totalAmount: number;
    printOptions: PrintOptions;
    paymentStatus: PaymentStatus;
    createdAt: Date;
    updatedAt: Date;
}
