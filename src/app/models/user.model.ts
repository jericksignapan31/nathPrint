export interface User {
    uid: string;
    email: string;
    name: string;
    role: 'customer' | 'admin';
    phone?: string;
    address?: string;
    createdAt: Date;
    updatedAt: Date;
}
