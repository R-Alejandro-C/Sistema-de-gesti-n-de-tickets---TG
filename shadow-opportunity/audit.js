const axios = require('axios');
const fs = require('fs');

const API_URL = 'http://localhost:4000/api/v1';

async function runAudit() {
    const auditResults = {
        autenticacion: [],
        autorizacion: [],
        validaciones: [],
        diseno_rest: [],
        funcionalidad: [],
        seguridad: []
    };

    let adminToken = '';
    let solicitanteToken = '';

    console.log('--- Iniciando Auditoría Técnica ---');

    // 1. Prueba de Autenticación
    try {
        console.log('Test: Login Admin');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@local.com',
            password: 'Admin123'
        });
        adminToken = loginRes.data.access_token;
        auditResults.autenticacion.push({ test: 'Login Admin Válido', status: 'PASS', code: loginRes.status });
    } catch (err) {
        auditResults.autenticacion.push({ test: 'Login Admin Válido', status: 'FAIL', error: err.response?.data || err.message });
    }

    try {
        console.log('Test: Login Password Incorrecto');
        await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@local.com',
            password: 'WrongPassword'
        });
        auditResults.autenticacion.push({ test: 'Login Password Incorrecto', status: 'FAIL', message: 'Permitió login con clave errónea' });
    } catch (err) {
        auditResults.autenticacion.push({ test: 'Login Password Incorrecto', status: 'PASS', code: err.response?.status });
    }

    // 2. Prueba de Autorización
    try {
        console.log('Test: Acceso a Users sin Token');
        await axios.get(`${API_URL}/users`);
        auditResults.autorizacion.push({ test: 'Acceso sin Token', status: 'FAIL', message: 'Permitió acceso sin auth' });
    } catch (err) {
        auditResults.autorizacion.push({ test: 'Acceso sin Token', status: 'PASS', code: err.response?.status });
    }

    try {
        console.log('Test: Listar Usuarios (Admin)');
        const usersRes = await axios.get(`${API_URL}/users`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        auditResults.autorizacion.push({ test: 'Listar Usuarios (Admin)', status: 'PASS', count: usersRes.data.data.length });

        // Verificar si se expone pass_hash
        const hasPassHash = usersRes.data.data.some(u => u.pass_hash);
        if (hasPassHash) {
            auditResults.seguridad.push({ test: 'Exposición de pass_hash', status: 'CRITICAL', message: 'Se encontró pass_hash en el listado de usuarios' });
        } else {
            auditResults.seguridad.push({ test: 'Exposición de pass_hash', status: 'PASS' });
        }
    } catch (err) {
        auditResults.autorizacion.push({ test: 'Listar Usuarios (Admin)', status: 'FAIL', error: err.response?.data || err.message });
    }

    // 3. Prueba de Diseño REST y Validaciones
    try {
        console.log('Test: Validación Payload Incompleto (Create User)');
        await axios.post(`${API_URL}/users`, { nombre: 'Test' }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        auditResults.validaciones.push({ test: 'Payload Incompleto', status: 'FAIL', message: 'Permitió crear usuario sin campos obligatorios' });
    } catch (err) {
        auditResults.validaciones.push({ test: 'Payload Incompleto', status: 'PASS', code: err.response?.status, errors: err.response?.data.message });
    }

    // 4. Prueba de Lógica (Ticket e Historial)
    try {
        console.log('Test: Crear Ticket (Público)');
        const ticketRes = await axios.post(`${API_URL}/tickets`, {
            nombre_solicitante: 'Auditor Externo',
            mail_solicitante: 'auditor@qa.com',
            id_categoria: 1,
            id_tipo: 1,
            detalle: 'Ticket de prueba para auditoría'
        });
        const ticketId = ticketRes.data.id_ticket;
        auditResults.funcionalidad.push({ test: 'Crear Ticket Público', status: 'PASS', id: ticketId });

        console.log('Test: Actualizar Estado y Generar Historial');
        // Primero necesitamos ver qué estados existen
        const statusRes = await axios.get(`${API_URL}/catalogos/estados`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const statusId = statusRes.data[1].id_estado; // El segundo estado

        await axios.patch(`${API_URL}/tickets/${ticketId}`, {
            id_estado: statusId,
            comentario_historial: 'Cambio de estado por auditoría'
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        const detailRes = await axios.get(`${API_URL}/tickets/${ticketId}`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        const hasHistory = detailRes.data.historial && detailRes.data.historial.length > 0;
        auditResults.funcionalidad.push({ test: 'Generación de Historial', status: hasHistory ? 'PASS' : 'FAIL' });
    } catch (err) {
        auditResults.funcionalidad.push({ test: 'Flujo Ticket/Historial', status: 'FAIL', error: err.response?.data || err.message });
    }

    // 5. Métricas
    try {
        console.log('Test: Obtener Métricas');
        const metricsRes = await axios.get(`${API_URL}/tickets/metrics`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        auditResults.diseno_rest.push({ test: 'Métricas API', status: 'PASS', data: metricsRes.data });
    } catch (err) {
        auditResults.diseno_rest.push({ test: 'Métricas API', status: 'FAIL', error: err.response?.data || err.message });
    }

    fs.writeFileSync('audit_report.json', JSON.stringify(auditResults, null, 2));
    console.log('--- Auditoría Finalizada. Reporte generado en audit_report.json ---');
}

runAudit();
