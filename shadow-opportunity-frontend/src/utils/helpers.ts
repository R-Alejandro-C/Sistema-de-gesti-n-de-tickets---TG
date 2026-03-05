import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
    return new Date(date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function getStatusColor(status: string) {
    const colors: Record<string, string> = {
        'Registrado': 'bg-blue-100 text-blue-700 border-blue-200',
        'Asignado': 'bg-yellow-100 text-yellow-700 border-yellow-200',
        'En Proceso': 'bg-orange-100 text-orange-700 border-orange-200',
        'Resuelto': 'bg-green-100 text-green-700 border-green-200',
        'Cerrado': 'bg-slate-100 text-slate-700 border-slate-200',
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
}
