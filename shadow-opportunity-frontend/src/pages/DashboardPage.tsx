import { useEffect, useState } from 'react';
import { ticketService } from '../api/services';
import { Ticket as TicketIcon, Clock, CheckCircle, AlertCircle, TrendingUp, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../utils/helpers';

export const DashboardPage = () => {
    const [metrics, setMetrics] = useState<any>(null);
    const [byStatus, setByStatus] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true);
                const [overview, statusDist] = await Promise.all([
                    ticketService.getMetricsOverview(),
                    ticketService.getTicketsByStatus()
                ]);
                setMetrics(overview);
                setByStatus(statusDist);
            } catch (err) {
                toast.error('Error al cargar datos del panel');
            } finally {
                setLoading(false);
            }
        };
        loadDashboard();
    }, []);

    if (loading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 size={40} className="animate-spin text-primary-500" /></div>;

    const cards = [
        { title: 'Total Tickets', value: metrics?.total_tickets, icon: TicketIcon, color: 'text-blue-500', bg: 'bg-blue-50', trend: 'Total Histórico' },
        { title: 'Registrados', value: metrics?.tickets_abiertos, icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50', trend: 'Por atender' },
        { title: 'SLA Cumplimiento', value: metrics?.sla_cumplimiento_estimado, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', trend: 'Objetivo > 90%' },
        { title: 'MTTR Promedio', value: `${metrics?.mttr_promedio_horas}h`, icon: Clock, color: 'text-purple-500', bg: 'bg-purple-50', trend: 'Tiempo de resolución' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Panel Principal</h1>
                <p className="text-slate-500 text-sm mt-1">Resumen general del estado operativo de los servicios hoy.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card) => (
                    <div key={card.title} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between transition-all hover:shadow-md">
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{card.title}</p>
                            <h3 className="text-3xl font-black text-slate-800 mt-2">{card.value}</h3>
                            <div className="flex items-center mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                <TrendingUp size={10} className="mr-1" />
                                <span>{card.trend}</span>
                            </div>
                        </div>
                        <div className={cn(card.bg, card.color, "p-3 rounded-xl shadow-inner")}>
                            <card.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* State Distribution */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 border-b pb-4">Tickets por Estado</h3>
                    <div className="space-y-6">
                        {byStatus.map((item: any) => (
                            <div key={item.estado}>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="font-bold text-slate-600">{item.estado}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-black text-slate-800">{item.total}</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">Tickets</span>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-50 border border-slate-100 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="bg-primary-500 h-full rounded-full transition-all duration-700"
                                        style={{ width: `${(item.total / (metrics?.total_tickets || 1)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                        {byStatus.length === 0 && <p className="text-center text-slate-400 py-4 text-sm font-medium">No hay datos por estado</p>}
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-primary-600 p-8 rounded-2xl shadow-xl text-white flex flex-col justify-between relative overflow-hidden group">
                    <div className="relative z-10">
                        <h3 className="text-2xl font-black mb-4">Métricas Detalladas</h3>
                        <p className="text-primary-100 text-sm leading-relaxed mb-6 opacity-80">
                            Accede al módulo de métricas para un análisis profundo por área, local, prioridad y rendimiento detallado de agentes con filtros temporales.
                        </p>
                        <a
                            href="/metrics"
                            className="inline-flex items-center justify-center bg-white text-primary-600 px-6 py-3 rounded-xl font-black text-sm transition-all hover:bg-primary-50 active:scale-95 shadow-lg"
                        >
                            Ver Métricas Avanzadas
                        </a>
                    </div>
                    <div className="absolute -right-10 -bottom-10 opacity-10 blur-2xl group-hover:opacity-20 transition-opacity">
                        <TrendingUp size={300} />
                    </div>
                </div>
            </div>
        </div>
    );
};
