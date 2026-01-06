import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { FirebaseService } from '../services/firebase.service';

export const authGuard = () => {
    const firebaseService = inject(FirebaseService);
    const router = inject(Router);

    return firebaseService.getCurrentUser().pipe(
        take(1),
        map((user) => {
            if (user) {
                return true;
            } else {
                router.navigate(['/auth/login']);
                return false;
            }
        })
    );
};
