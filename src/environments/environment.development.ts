// 🚨 1. Ejecutamos la lógica en la primera línea del archivo (fuera del export)
// Esto lee la URL que el usuario escribió en su navegador.
const host = window.location.hostname.toLowerCase();

// 🚨 2. Evaluamos la URL en caliente. 
// Si la URL tiene ".admin.", da TRUE (Clínica Enterprise). Si no, da FALSE (Consultorio).
const esClinicaEnterprise = host.includes('.admin.');

export const environment = {
    //local
    url_backend: 'http://127.0.0.1:8000/',
    url_servicios: 'http://127.0.0.1:8000/api',
    // url_frontend: 'http://localhost:4300/',
    url_media: 'http://127.0.0.1:8000/storage/',

    backend_node:"http://localhost:5000/api",
    socket_url:"http://localhost:5000",
    backend_CRM_node:"http://localhost:3000/api",

    // nombreSelected:'clinica-prueba',
    IS_CLINIC_DEPLOYMENT: esClinicaEnterprise,
    nombreSelected: esClinicaEnterprise ? 'clinica-prueba' : 'clinica-prueba', 
    // nombreSelected: esClinicaEnterprise ? 'clinica-prueba' : 'consultorio-independiente', 

    url_frontend: esClinicaEnterprise 
        ? 'https://consultorio.klyntic.com/' 
        : 'https://clinica.admin.klyntic.com/',
    
    
    //conexion a node y manejo de notificaciones
    // backend_node:"https://back-klyntic-envios.onrender.com/api",
    urlBackedNotification:'https://back-klyntic-envios.onrender.com/api/notipush/save-subscription',
    VAPI_KEY_PUBLIC: 'BG-UDqYJkOikTb0G7nNdKcpqZm__XCl0dwbJsx-kerpEecxL5rp079U7UMZxqo5XA0i60NGOVlezm1RAMyHRTbQ',
  
};