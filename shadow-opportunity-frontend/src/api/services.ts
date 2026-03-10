import api, { publicApi } from './axios';

// ============================================================
// SERVICIO PÚBLICO - sin autenticación
// Rutas: /api/v1/public/*
// ============================================================
export const publicCatalogService = {
    getCategories: (page = 1, limit = 100) =>
        publicApi.get(`/public/categorias?page=${page}&limit=${limit}`).then(res => res.data),
    getTypes: () =>
        publicApi.get('/public/tipos').then(res => res.data),
    getLocales: () =>
        publicApi.get('/public/locales').then(res => res.data),
    getAreas: (localId?: number) =>
        publicApi.get(localId ? `/public/areas?localId=${localId}` : '/public/areas').then(res => res.data),
    getAreaCategories: (areaId: number) =>
        publicApi.get(`/public/areas/${areaId}/categorias`).then(res => res.data),
    getCategorySubCategories: (catId: number) =>
        publicApi.get(`/public/categorias/${catId}/subcategorias`).then(res => res.data),
};

export const publicTicketService = {
    create: (data: any) =>
        publicApi.post('/tickets', data).then(res => res.data),
};

export const ticketService = {
    getAll: (page = 1, limit = 10, myTicketsOnly = false, search = '', statusId = 0) => {
        let url = `/tickets?page=${page}&limit=${limit}`;
        if (myTicketsOnly) url += '&owner=true';
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (statusId > 0) url += `&id_estado=${statusId}`;
        return api.get(url).then(res => res.data);
    },

    getById: (id: number) =>
        api.get(`/tickets/${id}`).then(res => res.data),

    create: (data: any) =>
        api.post('/tickets', data).then(res => res.data),

    update: (id: number, data: any) =>
        api.patch(`/tickets/${id}`, data).then(res => res.data),

    getMetricsOverview: (params?: any) =>
        api.get('/tickets/metrics/overview', { params }).then(res => res.data),

    getTicketsByStatus: (params?: any) =>
        api.get('/tickets/metrics/tickets-by-status', { params }).then(res => res.data),

    getTicketsByCategory: (params?: any) =>
        api.get('/tickets/metrics/tickets-by-category', { params }).then(res => res.data),

    getAgentPerformance: (params?: any) =>
        api.get('/tickets/metrics/agent-performance', { params }).then(res => res.data),

    getTicketsByArea: (params?: any) =>
        api.get('/tickets/metrics/tickets-by-area', { params }).then(res => res.data),

    getTicketsByLocal: (params?: any) =>
        api.get('/tickets/metrics/tickets-by-local', { params }).then(res => res.data),

    getTicketsByPriority: (params?: any) =>
        api.get('/tickets/metrics/tickets-by-priority', { params }).then(res => res.data),

    getMetrics: () =>
        api.get('/tickets/metrics').then(res => res.data),
};

export const authService = {
    login: (credentials: any) =>
        api.post('/auth/login', credentials).then(res => res.data),
    getProfile: () =>
        api.get('/auth/profile').then(res => res.data),
};

export const userService = {
    getAll: (page = 1, limit = 10) =>
        api.get(`/users?page=${page}&limit=${limit}`).then(res => res.data),
    create: (data: any) =>
        api.post('/users', data).then(res => res.data),
    update: (id: number, data: any) =>
        api.patch(`/users/${id}`, data).then(res => res.data),
    remove: (id: number) =>
        api.delete(`/users/${id}`).then(res => res.data),
};

export const roleService = {
    getAll: () => api.get('/roles').then(res => res.data),
    create: (data: any) => api.post('/roles', data).then(res => res.data),
    update: (id: number, data: any) => api.patch(`/roles/${id}`, data).then(res => res.data),
    remove: (id: number) => api.delete(`/roles/${id}`).then(res => res.data),
};

export const catalogService = {
    // Locales
    getLocales: (page = 1, limit = 10) => api.get(`/catalogos/locales?page=${page}&limit=${limit}`).then(res => res.data),
    getLocalAreas: (localId: number) => api.get(`/catalogos/locales/${localId}/areas`).then(res => res.data),
    createLocal: (data: any) => api.post('/catalogos/locales', data).then(res => res.data),
    updateLocal: (id: number, data: any) => api.patch(`/catalogos/locales/${id}`, data).then(res => res.data),
    deleteLocal: (id: number) => api.delete(`/catalogos/locales/${id}`).then(res => res.data),

    // Areas
    getAreas: (page = 1, limit = 10, localId?: number) => {
        let url = `/catalogos/areas?page=${page}&limit=${limit}`;
        if (localId) url += `&id_local=${localId}`;
        return api.get(url).then(res => res.data);
    },
    createArea: (data: any) => api.post('/catalogos/areas', data).then(res => res.data),
    getAreaCategories: (areaId: number) => api.get(`/catalogos/areas/${areaId}/categorias`).then(res => res.data),
    getCategorySubCategories: (catId: number) => api.get(`/catalogos/categorias/${catId}/subcategorias`).then(res => res.data),
    updateArea: (id: number, data: any) => api.patch(`/catalogos/areas/${id}`, data).then(res => res.data),
    deleteArea: (id: number) => api.delete(`/catalogos/areas/${id}`).then(res => res.data),

    // Categorias
    getCategories: (page = 1, limit = 10) => api.get(`/catalogos/categorias?page=${page}&limit=${limit}`).then(res => res.data),
    getArchivedCategories: () => api.get('/catalogos/categorias/archived').then(res => res.data),
    createCategory: (data: any) => api.post('/catalogos/categorias', data).then(res => res.data),
    updateCategory: (id: number, data: any) => api.patch(`/catalogos/categorias/${id}`, data).then(res => res.data),
    deleteCategory: (id: number) => api.delete(`/catalogos/categorias/${id}`).then(res => res.data),
    restoreCategory: (id: number) => api.patch(`/catalogos/categorias/${id}/restore`).then(res => res.data),

    // Subcategorias
    getSubCategories: (page = 1, limit = 10) => api.get(`/catalogos/subcategorias?page=${page}&limit=${limit}`).then(res => res.data),
    createSubCategory: (data: any) => api.post('/catalogos/subcategorias', data).then(res => res.data),
    updateSubCategory: (id: number, data: any) => api.patch(`/catalogos/subcategorias/${id}`, data).then(res => res.data),
    deleteSubCategory: (id: number) => api.delete(`/catalogos/subcategorias/${id}`).then(res => res.data),

    // Otros
    getStatuses: () => api.get('/catalogos/estados').then(res => res.data),
    getPriorities: () => api.get('/catalogos/prioridades').then(res => res.data),
    createPriority: (data: any) => api.post('/catalogos/prioridades', data).then(res => res.data),
    updatePriority: (id: number, data: any) => api.patch(`/catalogos/prioridades/${id}`, data).then(res => res.data),
    deletePriority: (id: number) => api.delete(`/catalogos/prioridades/${id}`).then(res => res.data),

    getTypes: () => api.get('/catalogos/tipos').then(res => res.data),
    createType: (data: any) => api.post('/catalogos/tipos', data).then(res => res.data),
    updateType: (id: number, data: any) => api.patch(`/catalogos/tipos/${id}`, data).then(res => res.data),
    deleteType: (id: number) => api.delete(`/catalogos/tipos/${id}`).then(res => res.data),
};
