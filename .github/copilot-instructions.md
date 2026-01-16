# NathPrint AI Agent Guidelines

## Project Overview
**NathPrint** is an Angular 21+ PWA for print shop management. It's a printing services platform enabling customers to submit orders and admins to manage operations, payments, and fulfillment.

**Tech Stack:** Angular 21, Firebase (Auth + Firestore + Storage), PrimeNG (UI), Tailwind CSS, RxJS, TypeScript

---

## Architecture

### High-Level Data Flow
```
Landing Page → Auth (Firebase) → Dashboard → Orders/Admin Views ↔ Firebase Firestore
                                                        ↓
                                            PrimeNG Components + Tailwind
```

### Key Services (Firestore-driven)
- **FirebaseService** (`src/app/services/firebase.service.ts`): Auth, generic CRUD
- **OrdersService**: Order lifecycle (create, query, update, delete)
- **PaymentsService**: Payment tracking and verification
- **UserService**: User profile, roles (admin/customer)
- **DocumentsService**: File uploads to Firebase Storage
- **FileUploadService**: Wrapper for document uploads

### Data Models (Firestore Collections)
Located in `src/app/models/`:
- **Order**: `orderId`, `userId`, `documents[]`, `printOptions`, `payment`, `status`, `createdAt`
- **User**: `uid`, `email`, `name`, `role` ('admin'|'customer'|'guest'), `phone`, `address`
- **Payment**: `paymentMethod` ('gcash'|'pay_on_shop'), `amount`, `status` ('unpaid'|'pending'|'paid'), `referenceNo`
- **OrderDocument**: Uploaded files with `documentId`, `fileUrl`, `uploadedAt`

**Status Enums** (critical for filtering):
- **OrderStatus**: 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled'
- **PaymentStatus**: 'unpaid' | 'pending' | 'paid'
- **UserRole**: 'admin' | 'customer' | 'guest'

### Routing Architecture
- **Root routes** (`src/app.routes.ts`): Landing, auth, layout-wrapped pages
- **Protected routes** (`src/app/pages/pages.routes.ts`): Guarded by `authGuard` or `adminGuard`
- **Lazy-loaded**: UIKit, auth pages, pages submodule
- **Admin routes**: Prefixed `/admin/*`, require `adminGuard` (role === 'admin')

### Guard Pattern
```typescript
// authGuard: Checks if user is logged in
// adminGuard: Checks if user.role === 'admin'
// Both use RxJS operators (take, map) and Firebase currentUser$ BehaviorSubject
```

---

## Critical Patterns & Conventions

### 1. Component Structure (Standalone)
- **Standalone components** (Angular 21 style) with `imports: [...]`
- **Inline templates** using backticks in `@Component({ template: \`...\` })`
- **ChangeDetectionStrategy.OnPush** for performance
- **Dependencies injected** via `inject()` (new Angular style, not constructor)

**Example:**
```typescript
@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<!-- inline HTML -->`
})
export class AdminOrdersComponent {
  private ordersService = inject(OrdersService);
  // ...
}
```

### 2. Firestore Query Pattern
Services return **Observables** (RxJS), not Promises. Always use `.pipe(map(...))` for transformations:

```typescript
// In services:
getOrder(id: string): Observable<Order> {
  return from(getDoc(ref)).pipe(
    map(snapshot => ({
      orderId: snapshot.id,
      ...snapshot.data(),
      createdAt: snapshot.data().createdAt?.toDate() // Handle Timestamp→Date
    }))
  );
}

// In components: Unsubscribe with async pipe in templates or takeUntilDestroyed()
```

### 3. Firebase Timestamp Handling
Firestore returns `Timestamp` objects. **Always convert** in services using `.toDate()`:
```typescript
createdAt: data['createdAt']?.toDate?.() || new Date()
```

### 4. Authentication Flow
- **FirebaseService** manages `currentUser$` BehaviorSubject (updated via `onAuthStateChanged`)
- Auth methods return Observables: `login()`, `register()`, `logout()`, `loginWithGoogle()`
- Guards inject `FirebaseService` and check `currentUser$.pipe(take(1), map(...))`

### 5. Role-Based Access Control (RBAC)
- **UserService** provides `getUserRole()` → Observable<UserRole>
- Admin routes protected by `adminGuard` (injected UserService)
- Admin UI components conditionally render based on `userRole`

### 6. UI & Styling
- **PrimeNG components**: `p-table`, `p-button`, `p-dialog`, `p-card`, `p-tag`, `p-divider`
- **Tailwind classes**: Used inline (e.g., `class="flex justify-between mb-4"`)
- **SCSS** for component-scoped styles (managed by Angular, not inspected by AI)
- **Currency formatting**: Use `{{ amount | number: '1.2-2' }}` or `toFixed(2)`, prefix `₱`

### 7. Observable Subscription Pattern
In templates, use **async pipe** to avoid manual subscriptions:
```html
<div *ngIf="order$ | async as order">
  {{ order.totalAmount }}
</div>
```

In components (if needed), use `takeUntilDestroyed()`:
```typescript
private destroy$ = inject(DestroyRef);
this.service.getData().pipe(
  takeUntilDestroyed(this.destroy$)
).subscribe(data => { /* ... */ });
```

---

## Developer Workflows

### Build & Serve
```bash
npm start                    # ng serve (localhost:4200)
npm run build              # Production build → dist/sakai-ng
npm run watch              # Development watch mode
npm test                   # Karma unit tests
npm run format             # Prettier format
```

### Generating Components
```bash
ng generate component pages/myfeature/my-component  # SCSS default
```

### Testing Considerations
- Unit tests in `*.spec.ts` (Karma/Jasmine)
- Firebase requires mocking (AngularFire provides test utilities)
- Services tested with mock Firestore

---

## Integration Points & External Dependencies

### Firebase Setup
- Config in `src/environments/firebase.config.ts` (injected in `app.config.ts`)
- Initialized in `appConfig` providers:
  - `provideFirebaseApp()`
  - `provideAuth()`, `provideFirestore()`, `provideStorage()`
- Security rules defined in Firebase Console (not in repo)

### PrimeNG & Tailwind Integration
- **Theme**: Aura preset (dark mode via `.app-dark` selector)
- **CSS imports**: `src/assets/styles.scss` includes PrimeIcons
- **Tailwind config**: Integrated via `tailwindcss-primeui` plugin

### Service Worker (PWA)
- Configured in `ngsw-config.json`
- Enabled in production (`isDevMode()` check in `app.config.ts`)
- Auto-updates via `registerWhenStable:30000`

### File Upload
- **FileUploadService**: Manages Firebase Storage uploads
- **DocumentsService**: Tracks uploaded documents in Firestore

---

## Common Issues & Gotchas

1. **Timestamp Conversion**: Always `.toDate()` Firestore Timestamps or comparisons fail
2. **Guard Delays**: `take(1)` prevents guard from waiting indefinitely
3. **NgZone Usage**: FirebaseService wraps auth listeners in `runOutsideAngular()` for performance
4. **Standalone Components**: Don't forget to import required modules in `imports: []`
5. **Admin Routes**: Verify `adminGuard` is applied and user has `role === 'admin'`
6. **Currency**: Philippine Peso (₱) used throughout; validate payment amounts are in centavos/whole pesos

---

## File Organization Reference

```
src/
  app/
    models/          ← All interfaces (Order, User, Payment, etc.)
    services/        ← Firebase integration & CRUD operations
    guards/          ← authGuard, adminGuard
    pages/
      orders/        ← Order management (customer & admin views)
      admin/         ← Admin-only features
      auth/          ← Login, signup, access control
    layout/          ← Menu, sidebar, topbar components
  environments/      ← firebase.config.ts
  assets/
    styles.scss      ← Global imports (PrimeIcons, layout)
    tailwind.css     ← Tailwind entry point
```

---

## Key Files to Reference
- Order model & statuses: [src/app/models/order.model.ts](../src/app/models/order.model.ts)
- Orders service (CRUD): [src/app/services/orders.service.ts](../src/app/services/orders.service.ts)
- Admin guard: [src/app/guards/admin.guard.ts](../src/app/guards/admin.guard.ts)
- Example admin component: [src/app/pages/orders/admin-in-progress-orders.component.ts](../src/app/pages/orders/admin-in-progress-orders.component.ts)
- App config (providers): [src/app.config.ts](../src/app.config.ts)
