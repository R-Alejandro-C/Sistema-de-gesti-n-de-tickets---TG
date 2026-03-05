const axios = require('axios');
const API_URL = 'http://localhost:4000/api/v1';

async function runAdvancedAudit() {
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
        email: 'admin@local.com',
        password: 'Admin123'
    });
    const token = loginRes.data.access_token;
    const authHeaders = { Authorization: `Bearer ${token}` };

    console.log('--- Auditoría Avanzada ---');

    // 1. SQL Injection Test
    try {
        console.log('Test: SQL Injection In Areas');
        await axios.post(`${API_URL}/catalogos/areas`, {
            nombre: "Area' OR '1'='1"
        }, { headers: authHeaders });
        console.log('[SECURITY] Detectado: Campo vulnerable a inyección de lógica (aunque TypeORM lo escapa, se permitió el string extraño)');
    } catch (err) {
        console.log('SQL Injection payload rejected/handled');
    }

    // 2. SLA & Resolution Time
    try {
        console.log('Test: SLA Calculation');
        // Cerrar el ticket 3
        const cerrarRes = await axios.patch(`${API_URL}/tickets/3`, {
            id_estado: 5, // Cerrado (basado en seed)
            solucion_detalle: 'Solución de prueba'
        }, { headers: authHeaders });

        const detail = await axios.get(`${API_URL}/tickets/3`, { headers: authHeaders });
        console.log('Resolution MS:', detail.data.tiempo_resolucion_ms);
    } catch (err) {
        console.log('Error in SLA test:', err.message);
    }

    // 3. Soft Delete
    try {
        console.log('Test: Soft Delete Areas');
        const area = await axios.post(`${API_URL}/catalogos/areas`, { nombre: 'Borrar' }, { headers: authHeaders });
        const areaId = area.data.id_area;
        await axios.delete(`${API_URL}/catalogos/areas/${areaId}`, { headers: authHeaders });

        const allAreas = await axios.get(`${API_URL}/catalogos/areas`, { headers: authHeaders });
        const exists = allAreas.data.data.find(a => a.id_area === areaId);
        console.log('Area Soft Deleted correctly:', !exists);
    } catch (err) {
        console.log('Error in Soft Delete test:', err.message);
    }

    // 4. Exposed Data Check
    try {
        console.log('Test: Sensitive Data in Profil');
        const profile = await axios.get(`${API_URL}/auth/profile`, { headers: authHeaders });
        if (profile.data.pass_hash || profile.data.password) {
            console.log('[SECURITY] CRITICAL: Profile endpoint exposes sensitive data!');
        } else {
            console.log('Profile clean');
        }
    } catch (err) {
        console.log('Error in profile test');
    }
}

runAdvancedAudit();
