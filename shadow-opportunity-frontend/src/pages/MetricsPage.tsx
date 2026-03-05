import { useEffect, useState } from 'react';
import { ticketService } from '../api/services';
import { Loader2, TrendingUp, Users, Target, Clock, FilterX, MapPin, Building2, ShieldAlert } from 'lucide-react';
import { cn } from '../utils/helpers';
import toast from 'react-hot-toast';

export const MetricsPage = () => {
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [overview, setOverview] = useState<any>(null);
    const [byStatus, setByStatus] = useState<any>(null);
    const [byCategory, setByCategory] = useState<any>(null);
    const [byArea, setByArea] = useState<any>(null);
    const [byLocal, setByLocal] = useState<any>(null);
    const [byPriority, setByPriority] = useState<any>(null);
    const [agentPerformance, setAgentPerformance] = useState<any>(null);

    const loadMetrics = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);

            const params: Record<string, string> = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const [ov, stat, cat, area, loc, prio, pfm] = await Promise.all([
                ticketService.getMetricsOverview(params),
                ticketService.getTicketsByStatus(params),
                ticketService.getTicketsByCategory(params),
                ticketService.getTicketsByArea(params),
                ticketService.getTicketsByLocal(params),
                ticketService.getTicketsByPriority(params),
                ticketService.getAgentPerformance(params)
            ]);

            setOverview(ov);
            setByStatus(stat);
            setByCategory(cat);
            setByArea(area);
            setByLocal(loc);
            setByPriority(prio);
            setAgentPerformance(pfm);
        } catch (err) {
            toast.error('Error al cargar datos métricos');
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    useEffect(() => {
        loadMetrics();
    }, [startDate, endDate]);

    const clearFilters = () => {
        setStartDate('');
        setEndDate('');
    };

    if (loading && !overview) {
        return <div className="flex h-[80vh] items-center justify-center"><Loader2 size={40} className="animate-spin text-primary-500" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Métricas KPI</h1>
                    <p className="text-sm text-slate-500 mt-1">Indicadores de rendimiento en vivo del Sistema de Tickets.</p>
                </div>

                {/* Temporal Filters */}
                <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 uppercase">Desde</span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-2 py-1 outline-none text-slate-700"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 uppercase">Hasta</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-2 py-1 outline-none text-slate-700"
                        />
                    </div>
                    {(startDate || endDate) && (
                        <button onClick={clearFilters} className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors" title="Limpiar Filtros">
                            <FilterX size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Overview KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Tickets Abiertos"
                    value={overview?.tickets_abiertos || 0}
                    total={overview?.total_tickets || 0}
                    icon={Target}
                    color="text-amber-500"
                    bg="bg-amber-50"
                />
                <MetricCard
                    title="Tickets en Proceso"
                    value={overview?.tickets_en_proceso || 0}
                    total={overview?.total_tickets || 0}
                    icon={TrendingUp}
                    color="text-blue-500"
                    bg="bg-blue-50"
                />
                <MetricCard
                    title="Tickets Finalizados"
                    value={(overview?.tickets_resueltos || 0) + (overview?.tickets_cerrados || 0)}
                    total={overview?.total_tickets || 0}
                    icon={Users}
                    color="text-emerald-500"
                    bg="bg-emerald-50"
                />
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                                <Clock size={24} />
                            </div>
                            <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">MTTR</span>
                        </div>
                        <h3 className="text-3xl font-black text-slate-800">{overview?.mttr_promedio_horas || '0'} hrs</h3>
                        <p className="text-sm font-medium text-slate-500 mt-1">Tiempo Promedio Res.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Distributions */}
                <DistributionList title="Por Estado" data={byStatus} dataKey="estado" total={overview?.total_tickets} />
                <DistributionList title="Por Prioridad" data={byPriority} dataKey="prioridad" total={overview?.total_tickets} icon={ShieldAlert} />
                <DistributionList title="Por Local" data={byLocal} dataKey="local" total={overview?.total_tickets} icon={Building2} />

                <DistributionList title="Por Área" data={byArea} dataKey="area" total={overview?.total_tickets} icon={MapPin} />
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 border-b pb-4">Volumen por Categoría</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {byCategory && byCategory.map((cat: any) => (
                                <div key={cat.categoria} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center transition-all hover:bg-white hover:shadow-md">
                                    <span className="font-semibold text-slate-600 truncate mr-2">{cat.categoria || 'Sin Asignar'}</span>
                                    <span className="px-3 py-1 bg-white border font-black text-primary-600 rounded-lg shadow-sm">
                                        {cat.total}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6 border-b pb-4">Productividad y Rendimiento por Agente</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                                <th className="pb-4 px-4">Agente</th>
                                <th className="pb-4 px-4 text-center">Asignados</th>
                                <th className="pb-4 px-4 text-center">Resueltos</th>
                                <th className="pb-4 px-4 text-center">MTTR (Hrs)</th>
                                <th className="pb-4 px-4 text-right">Efectividad</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {agentPerformance && agentPerformance.map((ag: any, idx: number) => (
                                <tr key={ag.agente} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white",
                                                idx === 0 ? "bg-amber-400 shadow-amber-100 shadow-lg" :
                                                    idx === 1 ? "bg-slate-400 shadow-slate-100 shadow-lg" :
                                                        idx === 2 ? "bg-orange-400 shadow-orange-100 shadow-lg" : "bg-primary-500"
                                            )}>
                                                {idx < 3 ? idx + 1 : ag.agente.substring(0, 1)}
                                            </div>
                                            <span className="font-bold text-slate-700">{ag.agente}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-center font-bold text-slate-600">{ag.total_asignados}</td>
                                    <td className="py-4 px-4 text-center">
                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full font-black text-xs">
                                            {ag.total_resueltos}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-center font-medium text-slate-500">{ag.mttr_horas}</td>
                                    <td className="py-4 px-4 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="font-black text-slate-800">{ag.efectividad}</span>
                                            <div className="w-20 bg-slate-100 h-1 rounded-full mt-1 overflow-hidden">
                                                <div className="bg-primary-500 h-full" style={{ width: ag.efectividad }}></div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {(!agentPerformance || agentPerformance.length === 0) && (
                        <p className="text-sm text-slate-400 text-center py-10">No hay datos de resolución de agentes en este periodo.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const DistributionList = ({ title, data, dataKey, total, icon: Icon = Target }: any) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6 border-b pb-4">
            <Icon size={18} className="text-slate-400" />
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        </div>
        <div className="space-y-4">
            {data && data.map((item: any) => (
                <div key={item[dataKey]} className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-slate-600">{item[dataKey] || 'N/A'}</span>
                        <span className="font-bold text-slate-800">{item.total}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary-500 rounded-full"
                            style={{ width: `${(item.total / (total || 1)) * 100}%` }}
                        ></div>
                    </div>
                </div>
            ))}
            {(!data || data.length === 0) && <p className="text-xs text-slate-400 text-center py-2">Sin datos</p>}
        </div>
    </div>
);

interface MetricCardProps {
    title: string;
    value: string | number;
    total: number;
    icon: any;
    color: string;
    bg: string;
}

const MetricCard = ({ title, value, total, icon: Icon, color, bg }: MetricCardProps) => {
    const percentage = total > 0 ? ((Number(value) / total) * 100).toFixed(1) : '0';

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", bg, color)}>
                        <Icon size={24} />
                    </div>
                    <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">{percentage}%</span>
                </div>
                <h3 className="text-3xl font-black text-slate-800">{value}</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">{title}</p>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                <div className={cn("h-full rounded-full", color.replace('text-', 'bg-'))} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};
