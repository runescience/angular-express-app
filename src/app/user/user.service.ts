import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { User } from './user.interface';
import { Role } from './role.interface';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = 'http://localhost:3000/api/users';
    private roleUrl = 'http://localhost:3000/api/roles';

    constructor(private http: HttpClient) { }

    getUsersWorking(): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}`);
    }

    getUsers(): Observable<User[]> {
        console.log('UserService: Requesting users with URL:', `${this.apiUrl}`);
        return this.http.get<User[]>(`${this.apiUrl}`).pipe(
            tap(users => {
                console.log('UserService: Response received:', users);
            }),
            catchError(error => {
                console.error('UserService: Error fetching users:', error);
                throw error;
            })
        );
    }


    getUserById(id: string): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/${id}`);
    }

    createUser(userData: any): Observable<User> {
        // Log the request data
        console.log('Creating user with data:', userData);
        return this.http.post<User>(this.apiUrl, userData).pipe(
            tap((response: any) => console.log('Server response:', response)),
            catchError(error => {
                console.error('Error creating user:', error);
                return throwError(() => error);
            })
        );
    }

    updateUser(id: string, userData: any): Observable<User> {
        // Password will only be included if changed
        return this.http.put<User>(`${this.apiUrl}/${id}`, userData);
    }



    deleteUser(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    // Role-related methods
    getAllRoles(): Observable<Role[]> {
        console.log('UserService: Requesting roles with URL:', this.roleUrl)

        return this.http.get<Role[]>(this.roleUrl);
    }

    updateUserRoles(userId: string, roleIds: string[]): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/${userId}/roles`, { roleIds });
    }
}
