import { useEffect, useState } from 'react';
import { catalogService } from '../api/services';
import { Plus, X, Loader2, Tag, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const CategoryPage = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [areas, setAreas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [form, setForm] = useState({ nombre: '', id_area: 0 });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [catRes, areaRes] = await Promise.all([
                catalogService.getCategories(1, 100),
                catalogService.getAreas(1, 100)
            ]);
            setCategories(Array.isArray(catRes) ? catRes : (catRes.data || []));
            setAreas(Array.isArray(areaRes) ? areaRes : (areaRes.data || []));
        } catch (err) {
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (cat: any) => {
        setSelectedCategory(cat);
        setForm({ nombre: cat.nombre, id_area: cat.id_area || cat.area?.id_area });
        setIsModalOpen(true);
    };

    const handleOpenCreate = () => {
        setSelectedCategory(null);
        setForm({ nombre: '', id_area: 0 });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.nombre || !form.id_area) return;
        setIsSubmitting(true);
        try {
            if (selectedCategory) {
                await catalogService.updateCategory(selectedCategory.id_categoria, form);
                toast.success('Categoría actualizada');
            } else {
                await catalogService.createCategory(form);
                toast.success('Categoría creada');
            }
            setForm({ nombre: '', id_area: 0 });
            setIsModalOpen(false);
            loadData();
        } catch (err) {
            toast.error('Error al guardar');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Seguro de eliminar esta categoría?')) return;
        try {
            await catalogService.deleteCategory(id);
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
                    <h2 className="text-2xl font-bold text-slate-800">Categorías de Soporte</h2>
                    <p className="text-slate-500 text-sm">Organice los tipos de incidentes por áreas operativas</p>
                </div>
                <button onClick={handleOpenCreate} className="btn-primary">
                    <Plus size={20} className="mr-2" />
                    Nueva Categoría
                </button>
            </div>

            <div className="card overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Categoría</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Área Responsable</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={3} className="text-center py-6 text-slate-400">Cargando...</td></tr>
                        ) : (
                            categories.map((cat) => (
                                <tr key={cat.id_categoria} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <Tag size={16} className="text-primary-400" />
                                        <span className="font-semibold text-slate-700">{cat.nombre}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium border border-slate-200 uppercase tracking-tighter">
                                            {cat.area?.nombre}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button onClick={() => handleEdit(cat)} className="p-2 hover:bg-amber-50 text-amber-500 rounded-lg">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(cat.id_categoria)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg">
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
                            <h3 className="font-bold text-slate-800">{selectedCategory ? 'Editar' : 'Configurar'} Categoría</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                                <input
                                    className="input-field"
                                    value={form.nombre}
                                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                    placeholder="Ej: Hardware, Software, Redes..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Área a la que pertenece</label>
                                <select
                                    className="input-field bg-white"
                                    value={form.id_area}
                                    onChange={(e) => setForm({ ...form, id_area: Number(e.target.value) })}
                                >
                                    <option value={0}>Seleccione un área...</option>
                                    {areas.map(a => <option key={a.id_area} value={a.id_area}>{a.nombre}</option>)}
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting || !form.nombre || !form.id_area}
                                className="btn-primary w-full py-2"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Guardar Categoría'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
