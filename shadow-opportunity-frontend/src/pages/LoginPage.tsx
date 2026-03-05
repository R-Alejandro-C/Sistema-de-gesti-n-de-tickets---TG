import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../api/services';
import { Lock, Mail, Loader2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export const LoginPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true);
        try {
            const response = await authService.login(data);
            login(response.user, response.access_token);
            toast.success(`Bienvenido, ${response.user.nombre}`);
            navigate('/');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al iniciar sesión');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200">
                        <Lock className="text-white" size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900">Acceso al Sistema</h2>
                    <p className="text-slate-500 mt-2">Ingrese sus credenciales para continuar</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="card p-8 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Correo Electrónico</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                {...register('email')}
                                type="email"
                                className="input-field pl-10"
                                placeholder="ejemplo@empresa.com"
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                {...register('password')}
                                type="password"
                                className="input-field pl-10"
                                placeholder="••••••••"
                            />
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full py-3 text-lg font-semibold"
                    >
                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                        Iniciar Sesión
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-slate-500 font-medium">O también puede</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate('/public-ticket')}
                        className="w-full border-2 border-primary-100 text-primary-600 hover:bg-primary-50 rounded-xl py-3 font-bold flex items-center justify-center transition-all"
                    >
                        <UserPlus className="mr-2" size={20} />
                        Crear Ticket como Invitado
                    </button>
                </form>

                <p className="text-center mt-8 text-slate-400 text-sm">
                    &copy; 2026 TicketFlow System. Todos los derechos reservados.
                </p>
            </div>
        </div>
    );
};
