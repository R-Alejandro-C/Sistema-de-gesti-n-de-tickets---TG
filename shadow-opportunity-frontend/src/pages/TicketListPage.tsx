import { useCallback, useEffect, useState } from 'react';
import { ticketService, catalogService } from '../api/services';
import { Search, Plus, Filter, Edit, X } from 'lucide-react';
import { getStatusColor, formatDate, cn } from '../utils/helpers';
import { TicketDetailModal } from '../components/TicketDetailModal';
import { CreateTicketModal } from '../components/CreateTicketModal';
import toast from 'react-hot-toast';

interface TicketListPageProps {
    myTicketsOnly?: boolean;
}

export const TicketListPage = ({ myTicketsOnly = false }: TicketListPageProps) => {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusId, setStatusId] = useState<number>(0);
    const [statuses, setStatuses] = useState<any[]>([]);

    // Modal State
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const loadTickets = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            const res = await ticketService.getAll(page, 8, myTicketsOnly, searchTerm, statusId);
            setTickets(Array.isArray(res) ? res : (res.data || []));
            setTotalPages(res.lastPage || 1);
        } catch (err) {
            if (showLoading) toast.error('Error al cargar tickets');
        } finally {
            if (showLoading) setLoading(false);
        }
    }, [page, myTicketsOnly, searchTerm, statusId]);

    const loadStatuses = async () => {
        try {
            const res = await catalogService.getStatuses();
            setStatuses(res);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadStatuses();
    }, []);

    // Reiniciar a página 1 cuando cambie el modo (Todos / Mis Tickets)
    useEffect(() => {
        setPage(1);
    }, [myTicketsOnly, searchTerm, statusId]);

    // Usar debouncing para la búsqueda (opcional pero recomendado)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadTickets();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [loadTickets]);

    // Polling effect para obtener actualizaciones en "tiempo real" en el dashboard
    useEffect(() => {
        // Carga el listado sin hacer que aparezca la alerta de "Cargando..."
        const intervalId = setInterval(() => {
            loadTickets(false);
        }, 8000);
        return () => clearInterval(intervalId);
    }, [loadTickets]);

    const handleOpenDetail = async (id: number) => {
        try {
            const ticket = await ticketService.getById(id);
            setSelectedTicket(ticket);
            setIsDetailModalOpen(true);
        } catch (err) {
            toast.error('Error al obtener detalles del ticket');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{myTicketsOnly ? 'Mis Tickets' : 'Gestión de Tickets'}</h2>
                    <p className="text-slate-500 text-sm">
                        {myTicketsOnly ? 'Seguimiento de sus solicitudes personales' : 'Administre y monitoree todas las solicitudes'}
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="btn-primary"
                >
                    <Plus size={20} className="mr-2" />
                    Crear Ticket
                </button>
            </div>

            {/* Filters & Search */}
            <div className="card p-4 flex flex-col sm:flex-row gap-4 items-center z-10">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por ID, solicitante o detalle..."
                        className="input-field pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            onClick={() => setSearchTerm('')}
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-48">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select
                            className="input-field pl-9 bg-white text-sm"
                            value={statusId}
                            onChange={(e) => setStatusId(Number(e.target.value))}
                        >
                            <option value={0}>Todos los Estados</option>
                            {statuses.map(s => (
                                <option key={s.id_estado} value={s.id_estado}>{s.nombre}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Ticket</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Solicitante</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Local</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Área</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Estado</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Prioridad</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={7} className="text-center py-10">Cargando datos...</td></tr>
                            ) : tickets.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-10 text-slate-400">No hay tickets registrados</td></tr>
                            ) : (
                                tickets.map((ticket) => (
                                    <tr key={ticket.id_ticket} className="hover:bg-slate-50/50 transition-colors text-sm">
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-primary-600">#{ticket.id_ticket}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="hidden sm:flex w-8 h-8 rounded-full bg-slate-100 items-center justify-center font-bold text-slate-500 text-xs">
                                                    {(ticket.nombre_solicitante || ticket.creador?.nombre || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-700">{ticket.nombre_solicitante || ticket.creador?.nombre}</p>
                                                    <p className="text-[10px] text-slate-400">{formatDate(ticket.fecha_creacion)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {ticket.localArea?.local?.nombre || <span className="text-slate-300 italic">N/A</span>}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {ticket.localArea?.area?.nombre || <span className="text-slate-300 italic">N/A</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-black uppercase border whitespace-nowrap", getStatusColor(ticket.estado?.nombre))}>
                                                {ticket.estado?.nombre}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {ticket.prioridad ? (
                                                <span className="flex items-center gap-1 text-slate-600">
                                                    <div className={cn("w-2 h-2 rounded-full", ticket.prioridad.id_prioridad === 3 ? "bg-red-500" : "bg-primary-400")}></div>
                                                    {ticket.prioridad.nombre}
                                                </span>
                                            ) : (
                                                <span className="text-slate-300 italic text-xs">No asignado</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button
                                                    onClick={() => handleOpenDetail(ticket.id_ticket)}
                                                    className="p-2 border border-slate-200 hover:bg-primary-50 text-slate-400 hover:text-primary-600 rounded-lg transition-all shadow-sm"
                                                    title="Gestionar Ticket"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-sm text-slate-500">
                            Página <span className="font-bold text-slate-900">{page}</span> de <span className="font-bold text-slate-900">{totalPages}</span>
                        </p>
                        <div className="flex gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="px-4 py-2 border rounded-lg bg-white text-sm font-medium hover:bg-slate-100 disabled:opacity-50 transition-all shadow-sm"
                            >
                                Anterior
                            </button>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="px-4 py-2 border rounded-lg bg-white text-sm font-medium hover:bg-slate-100 disabled:opacity-50 transition-all shadow-sm"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de Detalle */}
            {selectedTicket && (
                <TicketDetailModal
                    ticket={selectedTicket}
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    onUpdate={loadTickets}
                />
            )}

            {/* Modal de Creación */}
            <CreateTicketModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={loadTickets}
            />
        </div>
    );
};
