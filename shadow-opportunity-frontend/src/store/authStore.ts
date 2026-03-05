import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: number;
    nombre: string;
    role: 'ADMIN' | 'SOPORTE' | 'SOLICITANTE';
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            login: (user, token) => {
                localStorage.setItem('auth-token', token);
                set({ user, token, isAuthenticated: true });
            },
            logout: () => {
                localStorage.removeItem('auth-token');
                set({ user: null, token: null, isAuthenticated: false });
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);
