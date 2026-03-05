import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ticketService, catalogService, userService } from '../api/services';
import { X, Loader2, Save, History, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn, formatDate, getStatusColor } from '../utils/helpers';

const ticketUpdateSchema = z.object({
    id_estado: z.number().min(1, 'Estado requerido'),
    id_prioridad: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
    id_usuario_asignado: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
    id_categoria: z.preprocess((val) => val === '' ? undefined : Number(val), z.number().optional()),
    id_subcategoria: z.preprocess((val) => val === '' ? null : Number(val), z.number().nullable().optional()),
    solucion_detalle: z.string().optional(),
    comentario_historial: z.string().min(5, 'El comentario debe tener al menos 5 caracteres'),
});

type TicketUpdateForm = z.infer<typeof ticketUpdateSchema>;

interface TicketModalProps {
    ticket: any;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export const TicketDetailModal = ({ ticket, isOpen, onClose, onUpdate }: TicketModalProps) => {
    const [statuses, setStatuses] = useState<any[]>([]);
    const [priorities, setPriorities] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [subcategories, setSubCategories] = useState<any[]>([]);
    const [technicians, setTechnicians] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const { register, handleSubmit, reset, watch, setValue, formState: { isSubmitting, errors } } = useForm<any>({
        resolver: zodResolver(ticketUpdateSchema),
        defaultValues: {
            id_estado: ticket?.id_estado,
            id_prioridad: ticket?.id_prioridad,
            id_usuario_asignado: ticket?.id_usuario_asignado,
            id_categoria: ticket?.id_categoria,
            id_subcategoria: ticket?.id_subcategoria || '',
            comentario_historial: '',
        }
    });

    const selectedCategoria = watch('id_categoria');

    useEffect(() => {
        if (selectedCategoria && ticket && Number(selectedCategoria) !== ticket.id_categoria) {
            setValue('id_subcategoria', '');
        }
    }, [selectedCategoria, setValue, ticket]);

    useEffect(() => {
        if (isOpen) {
            loadConfigs();
            reset({
                id_estado: ticket?.id_estado,
                id_prioridad: ticket?.id_prioridad,
                id_usuario_asignado: ticket?.id_usuario_asignado,
                id_subcategoria: ticket?.id_subcategoria || '',
                comentario_historial: '',
            });
        }
    }, [isOpen, ticket, reset]);

    const loadConfigs = async () => {
        try {
            setLoading(true);
            const [st, pr, usr, sub, cat] = await Promise.all([
                catalogService.getStatuses(),
                catalogService.getPriorities(),
                userService.getAll(1, 100),
                catalogService.getSubCategories(1, 100),
                catalogService.getCategories(1, 100)
            ]);
            setStatuses(st);
            setPriorities(pr);
            setSubCategories(Array.isArray(sub) ? sub : (sub.data || []));
            setCategories(Array.isArray(cat) ? cat : (cat.data || []));
            // Filtrar usuarios que sean soporte o admin para asignar como técnico
            setTechnicians(usr.data.filter((u: any) => u.rol?.nombre !== 'SOLICITANTE'));
        } catch (err) {
            toast.error('Error al cargar configuraciones');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: TicketUpdateForm) => {
        try {
            await ticketService.update(ticket.id_ticket, data);
            toast.success('Ticket actualizado correctamente');
            onUpdate();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Error al actualizar ticket');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-primary-600">Ticket #{ticket.id_ticket}</span>
                        <span className={cn("px-2 py-0.5 rounded text-[10px] font-black uppercase border", getStatusColor(ticket.estado?.nombre))}>
                            {ticket.estado?.nombre}
                        </span>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit((data) => onSubmit(data as TicketUpdateForm))} className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Details & History */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <History size={18} className="text-primary-500" />
                                Información del Incidente
                            </h3>
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-bold">Solicitante</p>
                                    <p className="font-medium text-slate-700">{ticket.nombre_solicitante || ticket.creador?.nombre}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-bold">Fecha Registro</p>
                                    <p className="font-medium text-slate-700">{formatDate(ticket.fecha_creacion)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-bold">Tipo</p>
                                    <p className="font-medium text-slate-700">{ticket.tipo?.nombre}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-slate-400 uppercase font-bold mb-1 flex justify-between items-center">
                                        Categoría Afectada (Editable)
                                    </p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <select {...register('id_categoria', { valueAsNumber: true })} className="input-field bg-white py-1.5 px-3 text-sm h-10 border-slate-200">
                                            <option value="">Seleccione...</option>
                                            {categories.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
                                        </select>
                                        <select {...register('id_subcategoria')} className="input-field bg-white py-1.5 px-3 text-sm h-10 border-slate-200">
                                            <option value="">Sin Subcategoría</option>
                                            {selectedCategoria && subcategories
                                                .filter(s => s.id_categoria === Number(selectedCategoria) || s.categoria?.id_categoria === Number(selectedCategoria))
                                                .map(s => <option key={s.id_subcategoria} value={s.id_subcategoria}>{s.nombre}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-slate-400 uppercase font-bold">Detalle</p>
                                    <p className="text-sm text-slate-600 mt-1 italic">"{ticket.detalle}"</p>
                                </div>
                            </div>
                        </div>

                        {/* Histórico */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <History size={18} className="text-primary-500" />
                                Historial de Cambios
                            </h3>
                            <div className="space-y-3">
                                {ticket.historial?.length > 0 ? (
                                    ticket.historial.map((h: any) => (
                                        <div key={h.id_historia} className="border-l-2 border-primary-200 pl-4 py-1 relative">
                                            <div className="absolute -left-[5px] top-2 w-2 h-2 bg-primary-500 rounded-full"></div>
                                            <div className="flex justify-between items-start">
                                                <p className="text-xs font-bold text-slate-700">{h.usuario?.nombre || 'Sistema'}</p>
                                                <span className="text-[10px] text-slate-400">{formatDate(h.fecha_cambio)}</span>
                                            </div>
                                            <p className="text-sm text-slate-600">{h.comentario}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center py-4 text-slate-400 text-sm">No hay cambios registrados</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Actions */}
                    <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Save size={18} className="text-primary-500" />
                            Gestión Técnica
                        </h3>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Estado</label>
                                <select {...register('id_estado', { valueAsNumber: true })} className="input-field bg-white">
                                    {statuses.map(s => <option key={s.id_estado} value={s.id_estado}>{s.nombre}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Prioridad</label>
                                <select {...register('id_prioridad')} className="input-field bg-white">
                                    <option value="">Sin asignar</option>
                                    {priorities.map(p => <option key={p.id_prioridad} value={p.id_prioridad}>{p.nombre}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Técnico Asignado</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <select {...register('id_usuario_asignado')} className="input-field bg-white pl-10">
                                        <option value="">Por asignar</option>
                                        {technicians.map(t => <option key={t.id_usuario} value={t.id_usuario}>{t.nombre}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Comentario para Historial</label>
                                <textarea
                                    {...register('comentario_historial')}
                                    className="input-field bg-white"
                                    rows={3}
                                    placeholder="Explique el cambio realizado..."
                                ></textarea>
                                {errors.comentario_historial && <p className="text-red-500 text-[10px] mt-1">{errors.comentario_historial?.message as string}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Detalle Solución (Opcional)</label>
                                <textarea
                                    {...register('solucion_detalle')}
                                    className="input-field bg-white"
                                    rows={2}
                                    placeholder="Si se resuelve, detalle la solución..."
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || loading}
                                className="btn-primary w-full py-3 shadow-lg shadow-primary-200"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
