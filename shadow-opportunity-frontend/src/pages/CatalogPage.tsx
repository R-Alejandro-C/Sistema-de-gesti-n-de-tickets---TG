import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface CatalogPageProps {
    title: string;
    description: string;
    fetchData: (page: number) => Promise<any>;
    saveData: (data: any) => Promise<any>;
    updateData?: (id: number, data: any) => Promise<any>;
    deleteData?: (id: number) => Promise<any>;
    idField: string;
}

export const CatalogPage = ({ title, description, fetchData, saveData, updateData, deleteData, idField }: CatalogPageProps) => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [name, setName] = useState('');
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadItems();
    }, [fetchData, title]);

    const loadItems = async () => {
        try {
            setLoading(true);
            const res = await fetchData(1);
            setItems(Array.isArray(res) ? res : (res.data || []));
        } catch (err) {
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setSelectedId(null);
        setName('');
        setIsModalOpen(true);
    };

    const handleEdit = (item: any) => {
        setSelectedId(item[idField]);
        setName(item.nombre);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        setIsSubmitting(true);
        try {
            if (selectedId && updateData) {
                await updateData(selectedId, { nombre: name });
                toast.success('Registro actualizado');
            } else {
                await saveData({ nombre: name });
                toast.success('Registro creado');
            }
            setName('');
            setIsModalOpen(false);
            loadItems();
        } catch (err) {
            toast.error('Error al guardar');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!deleteData) return;
        if (!confirm('¿Seguro de eliminar?')) return;
        try {
            await deleteData(id);
            toast.success('Eliminado');
            loadItems();
        } catch (err) {
            toast.error('No se pudo eliminar');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
                    <p className="text-slate-500 text-sm">{description}</p>
                </div>
                <button onClick={handleOpenCreate} className="btn-primary">
                    <Plus size={20} className="mr-2" />
                    Agregar Nuevo
                </button>
            </div>

            <div className="card max-w-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Nombre</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={2} className="text-center py-6 text-slate-400">Cargando...</td></tr>
                        ) : items.length === 0 ? (
                            <tr><td colSpan={2} className="text-center py-6 text-slate-400">No hay registros</td></tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item[idField]} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 font-medium text-slate-700">{item.nombre}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center space-x-2">
                                            {updateData && (
                                                <button onClick={() => handleEdit(item)} className="p-2 hover:bg-amber-50 text-amber-500 rounded-lg">
                                                    <Edit size={16} />
                                                </button>
                                            )}
                                            {deleteData && (
                                                <button onClick={() => handleDelete(item[idField])} className="p-2 hover:bg-red-50 text-red-500 rounded-lg">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
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
                            <h3 className="font-bold text-slate-800">{selectedId ? 'Editar' : 'Crear'} Registro</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                                <input
                                    autoFocus
                                    className="input-field"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ingrese el nombre..."
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting || !name}
                                className="btn-primary w-full py-2"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Guardar'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
