import { Role } from './role.interface';

export interface User {
    user_id: string;
    username: string;
    email: string;
    password_hash: string;
    is_active: boolean;
    created_on: Date;
    updated_on: Date;
    roles?: Role[];
}
