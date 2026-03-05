import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { LogOut, LayoutDashboard, Ticket as TicketIcon, Users, Shield, Database, Menu, X, Tag, ListFilter, Inbox, BarChart } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useState } from 'react';
import { cn } from '../utils/helpers';

export const DashboardLayout = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['ADMIN', 'SOPORTE'] },
        { label: 'Métricas', icon: BarChart, path: '/metrics', roles: ['ADMIN', 'SOPORTE'] },
        { label: 'Tickets', icon: TicketIcon, path: '/tickets', roles: ['ADMIN', 'SOPORTE', 'SOLICITANTE'] },
        { label: 'Mis Tickets', icon: Inbox, path: '/my-tickets', roles: ['ADMIN', 'SOPORTE', 'SOLICITANTE'] },
        { label: 'Usuarios', icon: Users, path: '/users', roles: ['ADMIN'] },
        { label: 'Roles', icon: Shield, path: '/roles', roles: ['ADMIN'] },
        { label: 'Locales', icon: Database, path: '/locales', roles: ['ADMIN'] },
        { label: 'Áreas', icon: Database, path: '/areas', roles: ['ADMIN'] },
        { label: 'Categorías', icon: Tag, path: '/categories', roles: ['ADMIN'] },
        { label: 'Subcategorías', icon: Tag, path: '/subcategories', roles: ['ADMIN'] },
        { label: 'Prioridades', icon: ListFilter, path: '/priorities', roles: ['ADMIN'] },
        { label: 'Tipos', icon: ListFilter, path: '/types', roles: ['ADMIN'] },
    ];

    const filteredNav = navItems.filter(item => !item.roles || (user && item.roles.includes(user.role)));

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className={cn(
                "bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-20 shadow-xl",
                isSidebarOpen ? "w-64" : "w-20"
            )}>
                <div className="p-6 flex items-center justify-between">
                    {isSidebarOpen && (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center text-white font-bold">T</div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400">TicketFlow</span>
                        </div>
                    )}
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto custom-scrollbar">
                    {filteredNav.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.label}
                                onClick={() => navigate(item.path)}
                                className={cn(
                                    "w-full flex items-center p-3 rounded-xl transition-all duration-200 group relative",
                                    isActive
                                        ? "bg-primary-50 text-primary-600 shadow-sm"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <item.icon size={20} className={cn("min-w-[20px]", isActive ? "text-primary-600" : "group-hover:text-primary-500")} />
                                {isSidebarOpen && <span className="ml-3 font-semibold text-sm">{item.label}</span>}
                                {isActive && isSidebarOpen && <div className="absolute right-3 w-1.5 h-1.5 bg-primary-500 rounded-full"></div>}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all group"
                    >
                        <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                        {isSidebarOpen && <span className="ml-3 font-bold text-sm">Cerrar Sesión</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                <div className="absolute top-0 right-0 w-full h-64 bg-gradient-to-b from-primary-600/5 to-transparent pointer-events-none"></div>

                {/* Header */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-400">Plataforma</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-sm font-bold text-slate-600 capitalize">
                            {location.pathname === '/' ? 'Dashboard' : location.pathname.substring(1)}
                        </span>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3 border-l pl-4 ml-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-slate-900 leading-none mb-1">{user?.nombre}</p>
                                <span className="px-2 py-0.5 bg-slate-100 text-[10px] text-slate-600 font-black uppercase rounded border border-slate-200">
                                    {user?.role}
                                </span>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center text-white font-bold shadow-lg shadow-primary-200">
                                {user?.nombre?.charAt(0) || 'U'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 relative custom-scrollbar">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

