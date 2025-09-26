require('dotenv').config();

/**
 * Configuración central de la aplicación
 * Maneja todas las variables de entorno y configuraciones
 */
const config = {
    // Configuración de la aplicación
    app: {
        name: process.env.APP_NAME || 'GymMaster CLI',
        version: process.env.APP_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
    },

    // Configuración de MongoDB
    database: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
        name: process.env.MONGODB_DATABASE || 'gymmaster',
    },

    // Configuración de logs
    logging: {
        level: process.env.LOG_LEVEL || 'info',
    },

    // Configuración de validaciones
    validation: {
        // Niveles de plan permitidos
        planLevels: ['principiante', 'intermedio', 'avanzado'],
        
        // Estados de plan permitidos
        planStates: ['activo', 'cancelado', 'finalizado'],
        
        // Tipos de seguimiento permitidos
        trackingTypes: ['peso', 'grasa', 'medidas', 'fotos'],
        
        // Tipos de transacciones financieras
        transactionTypes: ['ingreso', 'egreso'],
    }
};

module.exports = config;
