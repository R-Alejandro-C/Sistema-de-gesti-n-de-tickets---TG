import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ticketService, catalogService } from '../api/services';
import { X, Loader2, Send, Ticket as TicketIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const ticketSchema = z.object({
    id_local: z.number().min(1, 'Seleccione un local'),
    id_local_area: z.number().min(1, 'Seleccione un área'),
    id_categoria: z.number().min(1, 'Seleccione una categoría'),
    id_subcategoria: z.number().optional(),
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
    const [subCategories, setSubCategories] = useState<any[]>([]);
    const [types, setTypes] = useState<any[]>([]);
    const [priorities, setPriorities] = useState<any[]>([]);
    const [locales, setLocales] = useState<any[]>([]);
    const [localAreas, setLocalAreas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<TicketForm>({
        resolver: zodResolver(ticketSchema),
        defaultValues: {
            id_local: 0,
            id_local_area: 0,
            id_categoria: 0,
            id_subcategoria: 0,
            id_tipo: 0,
            id_prioridad: 0,
            detalle: ''
        }
    });

    const selectedLocal = watch('id_local');
    const selectedLocalAreaId = watch('id_local_area');
    const selectedCategoryId = watch('id_categoria');

    // Cargar locales, tipos y prioridades al abrir
    useEffect(() => {
        if (isOpen) {
            loadInitialConfig();
        }
    }, [isOpen]);

    // Cuando cambia el local, cargar sus áreas
    useEffect(() => {
        if (selectedLocal > 0) {
            loadLocalAreas(selectedLocal);
        } else {
            setLocalAreas([]);
            setValue('id_local_area', 0);
        }
    }, [selectedLocal, setValue]);

    // Cuando cambia el área, cargar sus categorías
    useEffect(() => {
        if (selectedLocalAreaId > 0) {
            const area = localAreas.find((la: any) => la.id_local_area === selectedLocalAreaId)?.area;
            if (area) {
                catalogService.getAreaCategories(area.id_area)
                    .then(res => {
                        const cats = Array.isArray(res) ? res.map((ac: any) => ac.categoria).filter(Boolean) : [];
                        setCategories(cats);
                        setValue('id_categoria', 0);
                    })
                    .catch(() => setCategories([]));
            }
        } else {
            setCategories([]);
            setValue('id_categoria', 0);
        }
    }, [selectedLocalAreaId, localAreas, setValue]);

    // Cuando cambia la categoría, cargar sus subcategorías
    useEffect(() => {
        if (selectedCategoryId > 0) {
            catalogService.getCategorySubCategories(selectedCategoryId)
                .then(res => {
                    const subs = Array.isArray(res) ? res.map((csc: any) => csc.subCategory).filter(Boolean) : [];
                    setSubCategories(subs);
                    setValue('id_subcategoria', 0);
                })
                .catch(() => setSubCategories([]));
        } else {
            setSubCategories([]);
            setValue('id_subcategoria', 0);
        }
    }, [selectedCategoryId, setValue]);

    const loadInitialConfig = async () => {
        try {
            setLoading(true);
            const [typeRes, prioRes, locRes] = await Promise.all([
                catalogService.getTypes(),
                catalogService.getPriorities(),
                catalogService.getLocales(1, 100)
            ]);
            setTypes(Array.isArray(typeRes) ? typeRes : (typeRes.data || []));
            setPriorities(Array.isArray(prioRes) ? prioRes : (prioRes.data || []));
            setLocales(Array.isArray(locRes) ? locRes : (locRes.data || []));
        } catch (err) {
            toast.error('Error al cargar configuraciones iniciales');
        } finally {
            setLoading(false);
        }
    };

    const loadLocalAreas = async (localId: number) => {
        try {
            const data = await catalogService.getLocalAreas(localId);
            setLocalAreas(data);
            setValue('id_local_area', 0);
        } catch (err) {
            toast.error('Error al cargar áreas del local');
        }
    };


    const onSubmit = async (values: TicketForm) => {
        try {
            const { id_local, ...data } = values; // id_local solo es para el filtro
            await ticketService.create(data);
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans leading-relaxed text-slate-900 antialiased selection:bg-primary-100 selection:text-primary-700">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
                            <TicketIcon size={20} />
                        </div>
                        <h3 className="font-bold text-slate-800">Nuevo Ticket de Soporte</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1">1. Local</label>
                            <select
                                {...register('id_local', { valueAsNumber: true })}
                                className="input-field bg-white"
                                disabled={loading}
                            >
                                <option value={0}>Seleccione...</option>
                                {locales.map((l: any) => <option key={l.id_local} value={l.id_local}>{l.nombre}</option>)}
                            </select>
                            {errors.id_local && <p className="text-red-500 text-[10px] mt-1">{errors.id_local.message}</p>}
                        </div>

                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1">2. Área</label>
                            <select
                                {...register('id_local_area', { valueAsNumber: true })}
                                className="input-field bg-white"
                                disabled={loading || !selectedLocal}
                            >
                                <option value={0}>Seleccione...</option>
                                {localAreas.map((la: any) => (
                                    <option key={la.id_local_area} value={la.id_local_area}>
                                        {la.area?.nombre}
                                    </option>
                                ))}
                            </select>
                            {errors.id_local_area && <p className="text-red-500 text-[10px] mt-1">{errors.id_local_area.message}</p>}
                        </div>

                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1">3. Categoría</label>
                            <select
                                {...register('id_categoria', { valueAsNumber: true })}
                                className="input-field bg-white"
                                disabled={loading || !selectedLocalAreaId}
                            >
                                <option value={0}>Seleccione...</option>
                                {categories.map((c: any) => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
                            </select>
                            {errors.id_categoria && <p className="text-red-500 text-[10px] mt-1">{errors.id_categoria.message}</p>}
                        </div>

                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1">4. Subcategoría</label>
                            <select
                                {...register('id_subcategoria', { valueAsNumber: true })}
                                className="input-field bg-white"
                                disabled={loading || !selectedCategoryId}
                            >
                                <option value={0}>Ninguna / Seleccione...</option>
                                {subCategories.map((sc: any) => (
                                    sc && (
                                        <option key={sc.id_subcategoria} value={sc.id_subcategoria}>
                                            {sc.nombre}
                                        </option>
                                    )
                                ))}
                            </select>
                        </div>

                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                            <select
                                {...register('id_tipo', { valueAsNumber: true })}
                                className="input-field bg-white"
                                disabled={loading}
                            >
                                <option value={0}>Seleccione...</option>
                                {types.map((t: any) => <option key={t.id_tipo} value={t.id_tipo}>{t.nombre}</option>)}
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
                            {priorities.map((p: any) => <option key={p.id_prioridad} value={p.id_prioridad}>{p.nombre}</option>)}
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
