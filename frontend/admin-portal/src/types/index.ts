export enum UserRole {
    ADMIN = 'ADMIN',
    APPROVER = 'APPROVER',
    MAKER = 'MAKER',
}

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    createdAt?: string;
    updatedAt?: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken?: string;
}

export interface LoginDto {
    email: string;
    password: string;
}
