export const environment = {
    production: true,

    // 🏢 Backend Laravel de Producción para Clínicas Enterprise
    url_backend: 'https://backend-api-clinica-enterprise.onrender.com/',
    url_servicios: 'https://backend-api-clinica-enterprise.onrender.com/api',
    url_media: '',

    // Conexión a tu microservicio Node.js y manejo de sockets / push notifications
    backend_node: "https://back-klyntic-envios.onrender.com/api",
    socket_url: "https://back-klyntic-envios.onrender.com",
    
    // 🚀 Fallback de producción para identificar el entorno de la clínica de la doctora si entra sin subdominio
    backend_CRM_node:"https://backend-crmklyntic-mean.onrender.com/api",
    nombreSelected: 'clinica-prueba', 

    // URL oficial del frontend para el ecosistema de Clínicas
    url_frontend: 'https://clinica.klyntic.com/',
    urlBackedNotification: 'https://back-klyntic-envios.onrender.com/api/notipush/save-subscription',
    VAPI_KEY_PUBLIC: 'BG-UDqYJkOikTb0G7nNdKcpqZm__XCl0dwbJsx-kerpEecxL5rp079U7UMZxqo5XA0i60NGOVlezm1RAMyHRTbQ',
};