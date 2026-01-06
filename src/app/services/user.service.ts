import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDoc, setDoc, Timestamp } from '@angular/fire/firestore';
import { Observable, from, BehaviorSubject, map, switchMap, of } from 'rxjs';
import { User as FirebaseAuthUser } from '@angular/fire/auth';
import { User, UserRole } from '../models/user.model';
import { FirebaseService } from './firebase.service';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private currentUserData$ = new BehaviorSubject<User | null>(null);
    private collectionName = 'users';

    constructor(
        private firestore: Firestore,
        private firebaseService: FirebaseService
    ) {
        // Listen to auth state and fetch user data
        this.firebaseService.getCurrentUser().subscribe((authUser) => {
            if (authUser) {
                this.getUserData(authUser.uid).subscribe({
                    next: (userData) => {
                        this.currentUserData$.next(userData);
                    },
                    error: (err) => {
                        console.error('Failed to fetch user data', err);
                        this.currentUserData$.next(null);
                    }
                });
            } else {
                this.currentUserData$.next(null);
            }
        });
    }

    // Create user document in Firestore (called after registration)
    createUser(authUser: FirebaseAuthUser, role: UserRole = 'customer'): Observable<void> {
        const userRef = doc(this.firestore, this.collectionName, authUser.uid);
        const userData = {
            uid: authUser.uid,
            email: authUser.email || '',
            name: authUser.displayName || authUser.email?.split('@')[0] || 'User',
            role: role,
            photoURL: authUser.photoURL || undefined,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        };

        return from(setDoc(userRef, userData));
    }

    // Get user data from Firestore
    getUserData(uid: string): Observable<User | null> {
        const userRef = doc(this.firestore, this.collectionName, uid);
        return from(getDoc(userRef)).pipe(
            map((docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    return {
                        uid: docSnap.id,
                        ...data,
                        createdAt: data['createdAt']?.toDate ? data['createdAt'].toDate() : new Date(data['createdAt']),
                        updatedAt: data['updatedAt']?.toDate ? data['updatedAt'].toDate() : new Date(data['updatedAt'])
                    } as User;
                }
                return null;
            })
        );
    }

    // Get current user data as observable
    getCurrentUserData(): Observable<User | null> {
        return this.currentUserData$.asObservable();
    }

    // Get current user data value
    get currentUserDataValue(): User | null {
        return this.currentUserData$.value;
    }

    // Get user role
    getUserRole(): Observable<UserRole> {
        return this.currentUserData$.pipe(map((user) => user?.role || 'guest'));
    }

    // Update user profile
    updateUserProfile(uid: string, data: Partial<User>): Observable<void> {
        const userRef = doc(this.firestore, this.collectionName, uid);
        return from(
            setDoc(
                userRef,
                {
                    ...data,
                    updatedAt: Timestamp.now()
                },
                { merge: true }
            )
        );
    }
}
