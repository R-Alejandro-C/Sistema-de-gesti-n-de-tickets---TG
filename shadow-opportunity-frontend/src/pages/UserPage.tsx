import { useCallback, useEffect, useState } from 'react';
import { userService, roleService } from '../api/services';
import { Plus, Edit, Trash2, Shield, Mail, User as UserIcon, X, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { cn } from '../utils/helpers';

const userSchema = z.object({
    nombre: z.string().min(3, 'Nombre muy corto'),
    email: z.string().email('Email inválido'),
    password: z.string().optional(),
    id_rol: z.number().min(1, 'Seleccione un rol'),
    activo: z.boolean(),
});

type UserForm = z.infer<typeof userSchema>;

export const UserPage = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UserForm>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            nombre: '',
            email: '',
            password: '',
            id_rol: 0,
            activo: true,
        }
    });

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [userRes, roleRes] = await Promise.all([
                userService.getAll(1, 100),
                roleService.getAll()
            ]);
            // Manejar tanto si viene { data: [] } como si viene [] directamente
            setUsers(Array.isArray(userRes) ? userRes : (userRes.data || []));
            setRoles(roleRes);
        } catch (err) {
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleEdit = (user: any) => {
        setSelectedUser(user);
        reset({
            nombre: user.nombre,
            email: user.email,
            password: '',
            id_rol: user.id_rol || user.rol?.id_rol,
            activo: user.activo
        });
        setIsModalOpen(true);
    };

    const handleOpenCreate = () => {
        setSelectedUser(null);
        reset({ nombre: '', email: '', password: '', id_rol: undefined, activo: true });
        setIsModalOpen(true);
    };

    const onSubmit = async (data: UserForm) => {
        try {
            const payload = { ...data };

            if (selectedUser) {
                // Durante edición, si el password está vacío, lo removemos para no sobreescribir con vacío
                if (!payload.password) {
                    delete payload.password;
                }
                await userService.update(selectedUser.id_usuario, payload);
                toast.success('Usuario actualizado');
            } else {
                if (!payload.password) {
                    toast.error('La contraseña es requerida para nuevos usuarios');
                    return;
                }
                await userService.create(payload);
                toast.success('Usuario creado');
            }
            setIsModalOpen(false);
            loadData();
        } catch (err: any) {
            console.error('Error in onSubmit:', err);
            toast.error(err.response?.data?.message || 'Error en la operación');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Está seguro de eliminar este usuario?')) return;
        try {
            await userService.remove(id);
            toast.success('Usuario eliminado (Soft Delete)');
            loadData();
        } catch (err) {
            toast.error('No se pudo eliminar el usuario');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Cuentas de Usuario</h2>
                    <p className="text-slate-500 text-sm">Administre el acceso de personal administrativo y técnico</p>
                </div>
                <button onClick={handleOpenCreate} className="btn-primary">
                    <Plus size={20} className="mr-2" />
                    Crear Usuario
                </button>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Usuario</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Rol</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Estado</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={4} className="text-center py-10">Cargando...</td></tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u.id_usuario} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                                                    {(u.nombre || 'U').charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800">{u.nombre}</p>
                                                    <p className="text-xs text-slate-500">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-slate-600">
                                                <Shield size={14} className="mr-2 text-primary-500" />
                                                <span className="text-sm font-medium">{u.rol?.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                                                u.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                            )}>
                                                {u.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button onClick={() => handleEdit(u)} className="p-2 hover:bg-amber-50 text-amber-600 rounded-lg transition-colors">
                                                    <Edit size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(u.id_usuario)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">{selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input {...register('nombre')} className="input-field pl-10" placeholder="Ej: Juan Pérez" />
                                </div>
                                {errors.nombre && <p className="text-red-500 text-[10px] mt-1">{errors.nombre.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email Corporativo</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input {...register('email')} className="input-field pl-10" placeholder="juan@empresa.com" />
                                </div>
                                {errors.email && <p className="text-red-500 text-[10px] mt-1">{errors.email.message}</p>}
                            </div>

                            {!selectedUser && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña Inicial</label>
                                    <input {...register('password')} type="password" className="input-field" placeholder="••••••••" />
                                    {errors.password && <p className="text-red-500 text-[10px] mt-1">{errors.password.message}</p>}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Rol en el Sistema</label>
                                <select {...register('id_rol', { valueAsNumber: true })} className="input-field bg-white">
                                    <option value="">Seleccione un rol...</option>
                                    {roles.map(r => <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>)}
                                </select>
                                {errors.id_rol && <p className="text-red-500 text-[10px] mt-1">{errors.id_rol.message}</p>}
                            </div>

                            <div className="flex items-center py-2">
                                <input {...register('activo')} type="checkbox" className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500" />
                                <label className="ml-2 text-sm text-slate-600">Usuario Activo</label>
                            </div>

                            <div className="flex gap-3 pt-4 border-t">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-all">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary">
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (selectedUser ? 'Actualizar' : 'Crear')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
