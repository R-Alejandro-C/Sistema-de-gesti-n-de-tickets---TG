import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { publicCatalogService, publicTicketService } from '../api/services';
import { ArrowLeft, Send, CheckCircle2, Ticket as TicketIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const publicTicketSchema = z.object({
    nombre_solicitante: z.string().min(3, 'Nombre muy corto'),
    mail_solicitante: z.string().email('Email inválido').optional().or(z.literal('')),
    id_local: z.number().min(1, 'Seleccione un local'),
    id_area: z.number().min(1, 'Seleccione un área'),
    id_categoria: z.number().min(1, 'Seleccione una categoría'),
    id_tipo: z.number().min(1, 'Seleccione un tipo'),
    detalle: z.string().min(10, 'Describa el problema con más detalle'),
});

type PublicTicketForm = z.infer<typeof publicTicketSchema>;

export const PublicTicketPage = () => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [types, setTypes] = useState<any[]>([]);
    const [locales, setLocales] = useState<any[]>([]);
    const [areas, setAreas] = useState<any[]>([]);
    const [loadingConfig, setLoadingConfig] = useState(true);
    const navigate = useNavigate();

    const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<PublicTicketForm>({
        resolver: zodResolver(publicTicketSchema),
        defaultValues: {
            id_local: 0,
            id_area: 0,
            id_categoria: 0,
            id_tipo: 0,
            nombre_solicitante: '',
            mail_solicitante: '',
            detalle: ''
        }
    });

    const selectedLocal = watch('id_local');
    const filteredAreas = selectedLocal ? areas.filter(a => a.id_local === selectedLocal || a.local?.id_local === selectedLocal) : [];

    useEffect(() => {
        setValue('id_area', 0);
    }, [selectedLocal, setValue]);

    useEffect(() => {
        Promise.all([
            publicCatalogService.getCategories(1, 100),
            publicCatalogService.getTypes(),
            publicCatalogService.getLocales().catch(() => ({ data: [] })),
            publicCatalogService.getAreas().catch(() => ({ data: [] }))
        ]).then(([catRes, typeRes, locRes, areaRes]) => {
            setCategories(Array.isArray(catRes) ? catRes : (catRes.data || []));
            setTypes(Array.isArray(typeRes) ? typeRes : (typeRes.data || []));
            setLocales(Array.isArray(locRes) ? locRes : (locRes.data || []));
            setAreas(Array.isArray(areaRes) ? areaRes : (areaRes.data || []));
        }).catch(() => {
            toast.error('Error al cargar configuraciones');
        }).finally(() => {
            setLoadingConfig(false);
        });
    }, []);

    const onSubmit = async (data: PublicTicketForm) => {
        try {
            const payload = { ...data };
            if (!payload.mail_solicitante) {
                delete payload.mail_solicitante;
            }
            await publicTicketService.create(payload);
            setIsSubmitted(true);
            toast.success('Ticket registrado exitosamente');
        } catch (error: any) {
            toast.error('Error al registrar ticket');
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
                <div className="max-w-md w-full card p-10 text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={48} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">¡Ticket Registrado!</h2>
                    <p className="text-slate-500 mb-8">Hemos recibido su solicitud. Un técnico se pondrá en contacto pronto.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="btn-primary w-full"
                    >
                        Volver al Inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => navigate('/login')}
                    className="flex items-center text-slate-500 hover:text-primary-600 font-medium mb-8 transition-colors"
                >
                    <ArrowLeft size={18} className="mr-2" />
                    Volver al Login
                </button>

                <div className="card p-8 md:p-12">
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="p-3 bg-primary-100 text-primary-600 rounded-xl">
                            <TicketIcon size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Registrar Nuevo Ticket</h2>
                            <p className="text-slate-500 text-sm">No requiere iniciar sesión para reportar una falla</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Nombre Completo</label>
                            <input {...register('nombre_solicitante')} className="input-field" placeholder="Ej: Juan Pérez" />
                            {errors.nombre_solicitante && <p className="text-red-500 text-xs mt-1">{errors.nombre_solicitante.message}</p>}
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Correo de Contacto
                                <span className="ml-1 text-slate-400 font-normal text-xs">(opcional)</span>
                            </label>
                            <input
                                {...register('mail_solicitante')}
                                className="input-field"
                                placeholder="ejemplo@empresa.com"
                                type="email"
                            />
                            {errors.mail_solicitante && <p className="text-red-500 text-xs mt-1">{errors.mail_solicitante.message}</p>}
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Local</label>
                            <select {...register('id_local', { valueAsNumber: true })} className="input-field bg-white">
                                <option value={0}>Seleccione...</option>
                                {locales.map(l => <option key={l.id_local} value={l.id_local}>{l.nombre}</option>)}
                            </select>
                            {errors.id_local && <p className="text-red-500 text-xs mt-1">{errors.id_local.message}</p>}
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Área</label>
                            <select {...register('id_area', { valueAsNumber: true })} className="input-field bg-white">
                                <option value={0}>Seleccione...</option>
                                {filteredAreas.map(a => <option key={a.id_area} value={a.id_area}>{a.nombre}</option>)}
                            </select>
                            {errors.id_area && <p className="text-red-500 text-xs mt-1">{errors.id_area.message}</p>}
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Categoría</label>
                            <select {...register('id_categoria', { valueAsNumber: true })} className="input-field bg-white">
                                <option value={0}>Seleccione...</option>
                                {categories.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
                            </select>
                            {errors.id_categoria && <p className="text-red-500 text-xs mt-1">{errors.id_categoria.message}</p>}
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Solicitud</label>
                            <select {...register('id_tipo', { valueAsNumber: true })} className="input-field bg-white">
                                <option value="">Seleccione...</option>
                                {types.map(t => <option key={t.id_tipo} value={t.id_tipo}>{t.nombre}</option>)}
                            </select>
                            {errors.id_tipo && <p className="text-red-500 text-xs mt-1">{errors.id_tipo.message}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Detalle del Problema</label>
                            <textarea
                                {...register('detalle')}
                                rows={4}
                                className="input-field"
                                placeholder="Describa brevemente qué sucede..."
                            ></textarea>
                            {errors.detalle && <p className="text-red-500 text-xs mt-1">{errors.detalle.message}</p>}
                        </div>

                        <div className="md:col-span-2 mt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting || loadingConfig}
                                className="btn-primary w-full py-4 text-lg"
                            >
                                {isSubmitting ? 'Registrando...' : 'Enviar Solicitud'}
                                <Send size={20} className="ml-2" />
                            </button>
                        </div>
                    </form>
                </div>

                <p className="text-center mt-12 text-slate-400 text-sm">
                    Al enviar este formulario, usted acepta que el área de soporte técnico procese su información para resolver su incidente.
                </p>
            </div>
        </div>
    );
};
