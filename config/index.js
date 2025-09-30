// ===== IMPORTS Y DEPENDENCIAS =====
// Carga variables de entorno desde archivo .env
// PATRÓN: Dependency Injection - Se inyectan las dependencias a través del constructor
// PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (process.env) no de implementaciones concretas
require('dotenv').config(); // Carga variables de entorno desde archivo .env

/**
 * Configuración central de la aplicación
 * Maneja todas las variables de entorno y configuraciones
 * 
 * PATRÓN: Configuration Object - Centraliza toda la configuración de la aplicación
 * PATRÓN: Registry - Registra todas las configuraciones disponibles
 * PATRÓN: Data Transfer Object (DTO) - Proporciona configuración estructurada
 * PATRÓN: Module Pattern - Encapsula la configuración como módulo
 * PRINCIPIO SOLID S: Responsabilidad Única - Se encarga únicamente de la configuración
 * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas configuraciones
 * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (process.env)
 * 
 * NOTA: Este módulo NO maneja transacciones ya que solo proporciona configuración
 * BUENA PRÁCTICA: Configuración centralizada y estructurada
 */
const config = {
    // ===== CONFIGURACIÓN DE LA APLICACIÓN =====
    // PATRÓN: Configuration Object - Configuración específica de la aplicación
    // PATRÓN: Data Transfer Object (DTO) - Estructura configuración como objeto
    // PRINCIPIO SOLID S: Responsabilidad de configurar la aplicación
    app: {
        // PATRÓN: Strategy - Configuración de nombre de aplicación
        // BUENA PRÁCTICA: Nombre configurable desde variables de entorno
        name: process.env.APP_NAME || 'GymMaster CLI',
        // PATRÓN: Strategy - Configuración de versión de aplicación
        // BUENA PRÁCTICA: Versión configurable desde variables de entorno
        version: process.env.APP_VERSION || '1.0.0',
        // PATRÓN: Strategy - Configuración de entorno de ejecución
        // BUENA PRÁCTICA: Entorno configurable desde variables de entorno
        environment: process.env.NODE_ENV || 'development',
    },

    // ===== CONFIGURACIÓN DE MONGODB =====
    // PATRÓN: Configuration Object - Configuración específica de base de datos
    // PATRÓN: Data Transfer Object (DTO) - Estructura configuración como objeto
    // PRINCIPIO SOLID S: Responsabilidad de configurar la base de datos
    database: {
        // PATRÓN: Strategy - Configuración de URI de MongoDB
        // BUENA PRÁCTICA: URI configurable desde variables de entorno
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
        // PATRÓN: Strategy - Configuración de nombre de base de datos
        // BUENA PRÁCTICA: Nombre de base de datos configurable
        name: process.env.MONGODB_DATABASE || 'gymmaster',
    },

    // ===== CONFIGURACIÓN DE LOGS =====
    // PATRÓN: Configuration Object - Configuración específica de logging
    // PATRÓN: Data Transfer Object (DTO) - Estructura configuración como objeto
    // PRINCIPIO SOLID S: Responsabilidad de configurar el logging
    logging: {
        // PATRÓN: Strategy - Configuración de nivel de logging
        // BUENA PRÁCTICA: Nivel de logging configurable desde variables de entorno
        level: process.env.LOG_LEVEL || 'info',
    },

    // ===== CONFIGURACIÓN DE VALIDACIONES =====
    // PATRÓN: Configuration Object - Configuración específica de validaciones
    // PATRÓN: Data Transfer Object (DTO) - Estructura configuración como objeto
    // PATRÓN: Registry - Registra todas las opciones de validación
    // PRINCIPIO SOLID S: Responsabilidad de configurar las validaciones
    validation: {
        // ===== NIVELES DE PLAN PERMITIDOS =====
        // PATRÓN: Registry - Registra niveles de plan válidos
        // BUENA PRÁCTICA: Niveles de plan centralizados y configurables
        planLevels: ['principiante', 'intermedio', 'avanzado'],
        
        // ===== ESTADOS DE PLAN PERMITIDOS =====
        // PATRÓN: Registry - Registra estados de plan válidos
        // BUENA PRÁCTICA: Estados de plan centralizados y configurables
        planStates: ['activo', 'cancelado', 'finalizado'],
        
        // ===== TIPOS DE SEGUIMIENTO PERMITIDOS =====
        // PATRÓN: Registry - Registra tipos de seguimiento válidos
        // BUENA PRÁCTICA: Tipos de seguimiento centralizados y configurables
        trackingTypes: ['peso', 'grasa', 'medidas', 'fotos'],
        
        // ===== TIPOS DE TRANSACCIONES FINANCIERAS =====
        // PATRÓN: Registry - Registra tipos de transacciones válidos
        // BUENA PRÁCTICA: Tipos de transacciones centralizados y configurables
        transactionTypes: ['ingreso', 'egreso'],
    }
};

// ===== EXPORTACIÓN DEL MÓDULO =====
// PATRÓN: Module Pattern - Exporta la configuración como módulo
// PATRÓN: Configuration Object - Proporciona configuración centralizada
// PRINCIPIO SOLID S: Responsabilidad de proporcionar la interfaz pública de configuración
module.exports = config;
