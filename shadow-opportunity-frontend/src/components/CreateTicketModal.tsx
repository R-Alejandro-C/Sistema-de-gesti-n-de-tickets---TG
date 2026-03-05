import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ticketService, catalogService } from '../api/services';
import { X, Loader2, Send, Ticket as TicketIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const ticketSchema = z.object({
    id_local: z.number().min(1, 'Seleccione un local'),
    id_area: z.number().min(1, 'Seleccione un área'),
    id_categoria: z.number().min(1, 'Seleccione una categoría'),
    id_tipo: z.number().min(1, 'Seleccione un tipo'),
    id_prioridad: z.number().min(1, 'Seleccione una prioridad'),
    detalle: z.string().min(10, 'Describa el problema con más detalle'),
});

type TicketForm = z.infer<typeof ticketSchema>;

interface CreateTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateTicketModal = ({ isOpen, onClose, onSuccess }: CreateTicketModalProps) => {
    const [categories, setCategories] = useState<any[]>([]);
    const [types, setTypes] = useState<any[]>([]);
    const [priorities, setPriorities] = useState<any[]>([]);
    const [locales, setLocales] = useState<any[]>([]);
    const [areas, setAreas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<TicketForm>({
        resolver: zodResolver(ticketSchema),
        defaultValues: {
            id_local: 0,
            id_area: 0,
            id_categoria: 0,
            id_tipo: 0,
            id_prioridad: 0,
            detalle: ''
        }
    });

    const selectedLocal = watch('id_local');
    const filteredAreas = selectedLocal ? areas.filter(a => a.id_local === selectedLocal || a.local?.id_local === selectedLocal) : [];

    useEffect(() => {
        setValue('id_area', 0);
    }, [selectedLocal, setValue]);

    useEffect(() => {
        if (isOpen) {
            loadConfig();
        }
    }, [isOpen]);

    const loadConfig = async () => {
        try {
            setLoading(true);
            const [catRes, typeRes, prioRes, locRes, areaRes] = await Promise.all([
                catalogService.getCategories(1, 100),
                catalogService.getTypes(),
                catalogService.getPriorities(),
                catalogService.getLocales(1, 100),
                catalogService.getAreas(1, 100)
            ]);
            setCategories(Array.isArray(catRes) ? catRes : (catRes.data || []));
            setTypes(Array.isArray(typeRes) ? typeRes : (typeRes.data || []));
            setPriorities(Array.isArray(prioRes) ? prioRes : (prioRes.data || []));
            setLocales(Array.isArray(locRes) ? locRes : (locRes.data || []));
            setAreas(Array.isArray(areaRes) ? areaRes : (areaRes.data || []));
        } catch (err) {
            toast.error('Error al cargar configuraciones');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: TicketForm) => {
        try {
            const payload: any = { ...data };
            if ('mail_solicitante' in payload && !payload.mail_solicitante) {
                delete payload.mail_solicitante;
            }
            await ticketService.create(payload);
            toast.success('Ticket creado exitosamente');
            reset();
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Error al crear el ticket');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
                            <TicketIcon size={20} />
                        </div>
                        <h3 className="font-bold text-slate-800">Nuevo Ticket de Soporte</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Local</label>
                            <select
                                {...register('id_local', { valueAsNumber: true })}
                                className="input-field bg-white"
                                disabled={loading}
                            >
                                <option value={0}>Seleccione...</option>
                                {locales.map(l => <option key={l.id_local} value={l.id_local}>{l.nombre}</option>)}
                            </select>
                            {errors.id_local && <p className="text-red-500 text-[10px] mt-1">{errors.id_local.message}</p>}
                        </div>

                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Área</label>
                            <select
                                {...register('id_area', { valueAsNumber: true })}
                                className="input-field bg-white"
                                disabled={loading}
                            >
                                <option value={0}>Seleccione...</option>
                                {filteredAreas.map(a => <option key={a.id_area} value={a.id_area}>{a.nombre}</option>)}
                            </select>
                            {errors.id_area && <p className="text-red-500 text-[10px] mt-1">{errors.id_area.message}</p>}
                        </div>

                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                            <select
                                {...register('id_categoria', { valueAsNumber: true })}
                                className="input-field bg-white"
                                disabled={loading}
                            >
                                <option value={0}>Seleccione...</option>
                                {categories.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
                            </select>
                            {errors.id_categoria && <p className="text-red-500 text-[10px] mt-1">{errors.id_categoria.message}</p>}
                        </div>

                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                            <select
                                {...register('id_tipo', { valueAsNumber: true })}
                                className="input-field bg-white"
                                disabled={loading}
                            >
                                <option value={0}>Seleccione...</option>
                                {types.map(t => <option key={t.id_tipo} value={t.id_tipo}>{t.nombre}</option>)}
                            </select>
                            {errors.id_tipo && <p className="text-red-500 text-[10px] mt-1">{errors.id_tipo.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Prioridad Inicial</label>
                        <select
                            {...register('id_prioridad', { valueAsNumber: true })}
                            className="input-field bg-white"
                            disabled={loading}
                        >
                            <option value={0}>Seleccione...</option>
                            {priorities.map(p => <option key={p.id_prioridad} value={p.id_prioridad}>{p.nombre}</option>)}
                        </select>
                        {errors.id_prioridad && <p className="text-red-500 text-[10px] mt-1">{errors.id_prioridad.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Detalle de la Solicitud</label>
                        <textarea
                            {...register('detalle')}
                            rows={4}
                            className="input-field"
                            placeholder="Describa el problema o requerimiento..."
                        ></textarea>
                        {errors.detalle && <p className="text-red-500 text-[10px] mt-1">{errors.detalle.message}</p>}
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="flex-1 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-all">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isSubmitting || loading} className="flex-1 btn-primary">
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (
                                <>
                                    <Send size={18} className="mr-2" />
                                    Crear Ticket
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
