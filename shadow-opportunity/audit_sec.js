const axios = require('axios');
const API_URL = 'http://localhost:4000/api/v1';

async function runSecurityAudit() {
    const loginAdmin = await axios.post(`${API_URL}/auth/login`, {
        email: 'admin@local.com',
        password: 'Admin123'
    });
    const adminToken = loginAdmin.data.access_token;

    console.log('--- Auditoría de Seguridad y Roles ---');

    // 1. Crear un usuario SOLICITANTE
    console.log('Test: Creando usuario SOLICITANTE...');
    const rolesRes = await axios.get(`${API_URL}/roles`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const solicitanteRoleId = rolesRes.data.find(r => r.nombre === 'SOLICITANTE').id_rol;

    const userRes = await axios.post(`${API_URL}/users`, {
        nombre: 'Juan Solicitante',
        mail: 'juan@test.com',
        password: 'Password123',
        id_rol: solicitanteRoleId
    }, { headers: { Authorization: `Bearer ${adminToken}` } });

    const juanId = userRes.data.id_usuario;

    // 2. Login como Solicitante
    console.log('Test: Login como Solicitante...');
    const loginJuan = await axios.post(`${API_URL}/auth/login`, {
        email: 'juan@test.com',
        password: 'Password123'
    });
    const juanToken = loginJuan.data.access_token;

    // 3. Probar escalamiento de privilegios
    try {
        console.log('Test: Solicitante intentando listar usuarios (Prohibido)...');
        await axios.get(`${API_URL}/users`, { headers: { Authorization: `Bearer ${juanToken}` } });
        console.log('[SECURITY] CRITICAL: Solicitante pudo listar usuarios!');
    } catch (err) {
        console.log('Acceso denegado a usuarios para Solicitante (PASS)');
    }

    // 4. Probar visibilidad de tickets ajenos
    try {
        console.log('Test: Solicitante intentando ver ticket ajeno (Ticket 3)...');
        await axios.get(`${API_URL}/tickets/3`, { headers: { Authorization: `Bearer ${juanToken}` } });
        console.log('[SECURITY] CRITICAL: Solicitante pudo ver ticket de otro usuario!');
    } catch (err) {
        console.log('Acceso denegado a ticket ajeno (PASS)');
    }
}

runSecurityAudit();
