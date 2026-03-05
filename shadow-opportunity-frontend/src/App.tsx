import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { TicketListPage } from './pages/TicketListPage';
import { UserPage } from './pages/UserPage';
import { CatalogPage } from './pages/CatalogPage';
import { CategoryPage } from './pages/CategoryPage';
import { SubCategoryPage } from './pages/SubCategoryPage';
import { AreaPage } from './pages/AreaPage';
import { PublicTicketPage } from './pages/PublicTicketPage';
import { MetricsPage } from './pages/MetricsPage';
import { catalogService, roleService } from './api/services';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/public-ticket" element={<PublicTicketPage />} />
        <Route path="/publicticket" element={<Navigate to="/public-ticket" replace />} />
        <Route path="/guest-ticket" element={<Navigate to="/public-ticket" replace />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/metrics" element={<MetricsPage />} />
            <Route path="/tickets" element={<TicketListPage />} />
            <Route path="/my-tickets" element={<TicketListPage myTicketsOnly />} />
            <Route path="/users" element={<UserPage />} />

            {/* Simple Catalogs */}
            <Route path="/locales" element={
              <CatalogPage
                title="Locales"
                description="Gestión de locales"
                fetchData={catalogService.getLocales}
                saveData={catalogService.createLocal}
                updateData={catalogService.updateLocal}
                deleteData={catalogService.deleteLocal}
                idField="id_local"
              />
            } />

            <Route path="/roles" element={
              <CatalogPage
                title="Roles de Usuario"
                description="Gestión de niveles de acceso"
                fetchData={roleService.getAll}
                saveData={roleService.create}
                updateData={roleService.update}
                deleteData={roleService.remove}
                idField="id_rol"
              />
            } />

            <Route path="/priorities" element={
              <CatalogPage
                title="Prioridades"
                description="Niveles de urgencia para resolución"
                fetchData={catalogService.getPriorities}
                saveData={catalogService.createPriority}
                updateData={catalogService.updatePriority}
                deleteData={catalogService.deletePriority}
                idField="id_prioridad"
              />
            } />

            <Route path="/types" element={
              <CatalogPage
                title="Tipos de Ticket"
                description="Clasificación por naturaleza del incidente"
                fetchData={catalogService.getTypes}
                saveData={catalogService.createType}
                updateData={catalogService.updateType}
                deleteData={catalogService.deleteType}
                idField="id_tipo"
              />
            } />

            {/* Related Catalogs */}
            <Route path="/areas" element={<AreaPage />} />
            <Route path="/categories" element={<CategoryPage />} />
            <Route path="/subcategories" element={<SubCategoryPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
