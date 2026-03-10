import { useEffect, useState } from 'react';
import { catalogService } from '../api/services';
import { Plus, X, Loader2, Edit, Trash2, Database } from 'lucide-react';
import toast from 'react-hot-toast';

export const AreaPage = () => {
    const [areas, setAreas] = useState<any[]>([]);
    const [locales, setLocales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedArea, setSelectedArea] = useState<any>(null);
    const [form, setForm] = useState({ nombre: '', id_local: 0 });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [areaRes, locRes] = await Promise.all([
                catalogService.getAreas(1, 100),
                catalogService.getLocales(1, 100)
            ]);
            setAreas(Array.isArray(areaRes) ? areaRes : (areaRes.data || []));
            setLocales(Array.isArray(locRes) ? locRes : (locRes.data || []));
        } catch (err) {
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (area: any) => {
        setSelectedArea(area);
        setForm({ nombre: area.nombre, id_local: area.id_local || area.local?.id_local });
        setIsModalOpen(true);
    };

    const handleOpenCreate = () => {
        setSelectedArea(null);
        setForm({ nombre: '', id_local: 0 });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.nombre || !form.id_local) return;
        setIsSubmitting(true);
        try {
            if (selectedArea) {
                await catalogService.updateArea(selectedArea.id_area, form);
                toast.success('Área actualizada');
            } else {
                await catalogService.createArea(form);
                toast.success('Área creada');
            }
            setForm({ nombre: '', id_local: 0 });
            setIsModalOpen(false);
            loadData();
        } catch (err) {
            toast.error('Error al guardar');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Seguro de eliminar esta área?')) return;
        try {
            await catalogService.deleteArea(id);
            toast.success('Eliminado');
            loadData();
        } catch (err) {
            toast.error('No se pudo eliminar');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Áreas</h2>
                    <p className="text-slate-500 text-sm">Departamentos responsables agrupados por local</p>
                </div>
                <button onClick={handleOpenCreate} className="btn-primary">
                    <Plus size={20} className="mr-2" />
                    Nueva Área
                </button>
            </div>

            <div className="card overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Área</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Local Asignado</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={3} className="text-center py-6 text-slate-400">Cargando...</td></tr>
                        ) : areas.length === 0 ? (
                            <tr><td colSpan={3} className="text-center py-6 text-slate-400">No hay registros</td></tr>
                        ) : (
                            areas.map((area) => (
                                <tr key={area.id_area} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <Database size={16} className="text-primary-400" />
                                        <span className="font-semibold text-slate-700">{area.nombre}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {area.localAreas && area.localAreas.length > 0 ? (
                                                area.localAreas.map((la: any) => (
                                                    <span key={la.id_local} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold border border-slate-200 uppercase">
                                                        {la.local?.nombre}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-slate-400 italic text-xs">Sin locales</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button onClick={() => handleEdit(area)} className="p-2 hover:bg-amber-50 text-amber-500 rounded-lg">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(area.id_area)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">{selectedArea ? 'Editar' : 'Configurar'} Área</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                                <input
                                    className="input-field"
                                    value={form.nombre}
                                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                    placeholder="Ej: Sistemas, Recursos Humanos..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Local asociado</label>
                                <select
                                    className="input-field bg-white"
                                    value={form.id_local}
                                    onChange={(e) => setForm({ ...form, id_local: Number(e.target.value) })}
                                >
                                    <option value={0}>Seleccione un local...</option>
                                    {locales.map(l => <option key={l.id_local} value={l.id_local}>{l.nombre}</option>)}
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting || !form.nombre || !form.id_local}
                                className="btn-primary w-full py-2"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Guardar Área'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
