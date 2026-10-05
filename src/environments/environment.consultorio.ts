// 🏢 1. Analizamos el host del navegador en caliente
const host = window.location.hostname.toLowerCase();
const domainParts = host.split('.');

// 🏢 2. Lógica polimórfica alineada con tu servicio:
// Es un despliegue de clínica si tiene subdominio (3 partes o más) 
// y no es el dominio raíz limpio ni el subdominio genérico de médicos independientes
const esDespliegueClinica = domainParts.length >= 3 && domainParts[0] !== 'www' && domainParts[0] !== 'consultorio';


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
    
    // 🚀 Ahora el flag es dinámico y compatible con el Caso A y Caso B de tu servicio
    IS_CLINIC_DEPLOYMENT: esDespliegueClinica,
    nombreSelected: esDespliegueClinica ? 'clinica-dinamica' : 'consultorio-independiente', 

    url_frontend: esDespliegueClinica 
        ? 'https://consultorio.klyntic.com/' 
        : 'https://clinica.admin.klyntic.com/',

    urlBackedNotification: 'https://back-klyntic-envios.onrender.com/api/notipush/save-subscription',
    VAPI_KEY_PUBLIC: 'BG-UDqYJkOikTb0G7nNdKcpqZm__XCl0dwbJsx-kerpEecxL5rp079U7UMZxqo5XA0i60NGOVlezm1RAMyHRTbQ',
};
