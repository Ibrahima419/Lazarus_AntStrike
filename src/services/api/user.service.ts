/**
 * 👤 User Service - API calls for user management
 */

import apiClient from '../../lib/api-client';

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateUserData {
    email: string;
    name: string;
    role: 'admin' | 'analyst';
    password?: string;
}

export const userService = {
    /**
     * Get all users
     */
    async getUsers(): Promise<User[]> {
        const response = await apiClient.get<User[]>('/users');
        return response.data;
    },

    /**
     * Create a new user
     */
    async createUser(data: CreateUserData): Promise<{ user: User; temporaryPassword?: string }> {
        const response = await apiClient.post<{ user: User; temporaryPassword?: string }>('/users', data);
        return response.data;
    },

    /**
     * Delete a user
     */
    async deleteUser(userId: string): Promise<void> {
        await apiClient.delete(`/users/${userId}`);
    }
};
