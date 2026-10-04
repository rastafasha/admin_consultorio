// src/environments/environment.prod.ts

// 🚨 1. Ejecutamos la lógica en la primera línea del archivo (fuera del export)
// Esto lee la URL que el usuario escribió en su navegador.
const host = window.location.hostname.toLowerCase();

// 🚨 2. Evaluamos la URL en caliente. 
// Si la URL tiene ".admin.", da TRUE (Clínica Enterprise). Si no, da FALSE (Consultorio).
const esClinicaEnterprise = host.includes('.admin.');

export const environment = {
    production: true,

    // 🏢 3. Usamos un condicional ternario para asignar las URLs dinámicamente
    url_backend: 'https://backend-api-consultorio.onrender.com/',

    url_servicios: 'https://backend-api-consultorio.onrender.com/api',
    url_media: '',

    // Conexión común para ambos mundos
    backend_node: "https://back-klyntic-envios.onrender.com/api",
    socket_url: "https://back-klyntic-envios.onrender.com",
    backend_CRM_node: "https://backend-crmklyntic-mean.onrender.com/api",
    
    // 🚀 4. Mapeamos los flags usando la variable que creamos arriba
    IS_CLINIC_DEPLOYMENT: esClinicaEnterprise,
    nombreSelected: esClinicaEnterprise ? 'clinica-enterprise' : 'consultorio-independiente', 

    url_frontend: esClinicaEnterprise 
        ? 'https://consultorio.klyntic.com/' 
        : 'https://clinica.admin.klyntic.com/',

    urlBackedNotification: 'https://back-klyntic-envios.onrender.com/api/notipush/save-subscription',
    VAPI_KEY_PUBLIC: 'BG-UDqYJkOikTb0G7nNdKcpqZm__XCl0dwbJsx-kerpEecxL5rp079U7UMZxqo5XA0i60NGOVlezm1RAMyHRTbQ',
};
