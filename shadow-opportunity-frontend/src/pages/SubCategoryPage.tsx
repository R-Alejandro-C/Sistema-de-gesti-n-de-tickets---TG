import { useEffect, useState } from 'react';
import { catalogService } from '../api/services';
import { Plus, X, Loader2, Layers, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const SubCategoryPage = () => {
    const [subCategories, setSubCategories] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSubCategory, setSelectedSubCategory] = useState<any>(null);
    const [form, setForm] = useState({ nombre: '', id_categoria: 0 });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [subRes, catRes] = await Promise.all([
                catalogService.getSubCategories(1, 100),
                catalogService.getCategories(1, 100)
            ]);
            setSubCategories(Array.isArray(subRes) ? subRes : (subRes.data || []));
            setCategories(Array.isArray(catRes) ? catRes : (catRes.data || []));
        } catch (err) {
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (sub: any) => {
        setSelectedSubCategory(sub);
        // Usar la primera categoría asignada para el formulario por ahora
        const firstCatId = sub.categorySubCategories?.[0]?.id_categoria || 0;
        setForm({ nombre: sub.nombre, id_categoria: firstCatId });
        setIsModalOpen(true);
    };

    const handleOpenCreate = () => {
        setSelectedSubCategory(null);
        setForm({ nombre: '', id_categoria: 0 });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.nombre || !form.id_categoria) return;
        setIsSubmitting(true);
        try {
            if (selectedSubCategory) {
                await catalogService.updateSubCategory(selectedSubCategory.id_subcategoria, form);
                toast.success('Subcategoría actualizada');
            } else {
                await catalogService.createSubCategory(form);
                toast.success('Subcategoría creada');
            }
            setForm({ nombre: '', id_categoria: 0 });
            setIsModalOpen(false);
            loadData();
        } catch (err) {
            toast.error('Error al guardar');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Seguro de eliminar esta subcategoría?')) return;
        try {
            await catalogService.deleteSubCategory(id);
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
                    <h2 className="text-2xl font-bold text-slate-800">Subcategorías</h2>
                    <p className="text-slate-500 text-sm">Detalle específico para la clasificación de tickets</p>
                </div>
                <button onClick={handleOpenCreate} className="btn-primary">
                    <Plus size={20} className="mr-2" />
                    Nueva Subcategoría
                </button>
            </div>

            <div className="card overflow-hidden max-w-5xl">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Subcategoría</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Categorías / Áreas</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={3} className="text-center py-6 text-slate-400">Cargando...</td></tr>
                        ) : (
                            subCategories.map((sub) => (
                                <tr key={sub.id_subcategoria} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 flex items-center gap-3 font-semibold text-slate-700">
                                        <Layers size={16} className="text-primary-400" />
                                        {sub.nombre}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {sub.categorySubCategories && sub.categorySubCategories.length > 0 ? (
                                                sub.categorySubCategories.map((csc: any) => (
                                                    <span key={csc.id_categoria} className="px-2 py-1 bg-primary-50 text-primary-600 rounded text-[10px] font-bold border border-primary-100 uppercase flex flex-col">
                                                        <span>{csc.category?.nombre}</span>
                                                        <span className="text-[8px] text-slate-400 border-t border-primary-100 mt-0.5 pt-0.5">
                                                            {csc.category?.areaCategories?.map((ac: any) => ac.area?.nombre).join(', ') || 'Sin área'}
                                                        </span>
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-slate-400 italic text-xs">Sin categorías</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button onClick={() => handleEdit(sub)} className="p-2 hover:bg-amber-50 text-amber-500 rounded-lg" title="Editar / Asignar Categoría">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(sub.id_subcategoria)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg">
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
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50 text-slate-800">
                            <h3 className="font-bold">{selectedSubCategory ? 'Editar' : 'Nueva'} Subcategoría</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                                <input className="input-field" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Laptop, Desktop, Impresora..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Categoría Padre</label>
                                <select className="input-field bg-white text-sm" value={form.id_categoria} onChange={(e) => setForm({ ...form, id_categoria: Number(e.target.value) })}>
                                    <option value={0}>Seleccione...</option>
                                    {categories.map(c => {
                                        const areaName = c.areaCategories?.[0]?.area?.nombre || 'Sin área';
                                        return (
                                            <option key={c.id_categoria} value={c.id_categoria}>
                                                {c.nombre} ({areaName})
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                            <button type="submit" disabled={isSubmitting || !form.nombre || !form.id_categoria} className="btn-primary w-full py-2">
                                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Guardar'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
