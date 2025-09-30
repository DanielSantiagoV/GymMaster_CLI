// ===== IMPORTS Y DEPENDENCIAS =====
// Importación de configuración de base de datos
// PATRÓN: Dependency Injection - Se inyectan las dependencias a través del constructor
// PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (DatabaseConfig) no de implementaciones concretas
const DatabaseConfig = require('./database'); // Configuración específica de MongoDB
const config = require('./index'); // Configuración general de la aplicación

/**
 * Singleton para manejar la conexión a MongoDB
 * Asegura una sola instancia de conexión en toda la aplicación
 * 
 * PATRÓN: Singleton - Garantiza una sola instancia de conexión
 * PATRÓN: Facade - Proporciona una interfaz simplificada para la conexión
 * PATRÓN: Manager - Gestiona el ciclo de vida de la conexión
 * PATRÓN: Data Transfer Object (DTO) - Proporciona conexión estructurada
 * PRINCIPIO SOLID S: Responsabilidad Única - Se encarga únicamente de la gestión de conexiones
 * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades de conexión
 * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (DatabaseConfig)
 * 
 * NOTA: Este módulo NO maneja transacciones ya que solo gestiona la conexión
 * BUENA PRÁCTICA: Gestor de conexiones centralizado y optimizado
 */
class ConnectionManager {
    /**
     * Constructor del gestor de conexiones
     * 
     * PATRÓN: Singleton - Inicializa el estado del singleton
     * PATRÓN: Manager - Gestiona el estado de la conexión
     * PRINCIPIO SOLID S: Responsabilidad de inicializar el gestor de conexiones
     * BUENA PRÁCTICA: Inicialización del estado de conexión en constructor
     */
    constructor() {
        // PATRÓN: Dependency Injection - Inyecta dependencia de configuración
        // PRINCIPIO SOLID D: Depende de abstracción DatabaseConfig
        this.dbConfig = new DatabaseConfig();
        // PATRÓN: State - Mantiene el estado de conexión
        // PRINCIPIO SOLID S: Responsabilidad de rastrear el estado de conexión
        this.isConnected = false;
    }

    /**
     * Inicializa la conexión a MongoDB
     * @returns {Promise<Object>} Cliente y base de datos conectados
     * 
     * PATRÓN: Template Method - Define el flujo estándar de inicialización
     * PATRÓN: Singleton - Garantiza una sola conexión
     * PATRÓN: Facade - Proporciona interfaz simplificada para conexión
     * PATRÓN: Data Transfer Object (DTO) - Retorna conexión estructurada
     * PATRÓN: Guard Clause - Validaciones tempranas
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de inicializar conexiones
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para inicialización
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (DatabaseConfig)
     * 
     * NOTA: No hay transacciones ya que solo gestiona la conexión
     * BUENA PRÁCTICA: Método principal que orquesta la inicialización de conexiones
     */
    async initialize() {
        try {
            // ===== VALIDACIÓN DE CONEXIÓN EXISTENTE =====
            // PATRÓN: Guard Clause - Validación temprana de conexión existente
            // PATRÓN: Singleton - Reutiliza conexión existente
            // PRINCIPIO SOLID S: Responsabilidad de evitar conexiones duplicadas
            if (this.isConnected) {
                return { client: this.dbConfig.client, db: this.dbConfig.db };
            }

            // ===== ESTABLECIMIENTO DE CONEXIÓN =====
            // PATRÓN: Facade - Delega la conexión a DatabaseConfig
            // PRINCIPIO SOLID S: Delegación de responsabilidad de conexión
            const connection = await this.dbConfig.connect();
            
            // ===== ACTUALIZACIÓN DE ESTADO =====
            // PATRÓN: State - Actualiza el estado de conexión
            // PRINCIPIO SOLID S: Responsabilidad de mantener estado consistente
            this.isConnected = true;
            
            // ===== OPTIMIZACIÓN DE CONSULTAS =====
            // PATRÓN: Strategy - Delegación de creación de índices
            // BUENA PRÁCTICA: Crear índices para optimizar consultas frecuentes
            await this.createIndexes(connection.db);
            
            // ===== RETORNO DE CONEXIÓN =====
            // PATRÓN: Data Transfer Object (DTO) - Retorna conexión estructurada
            // PRINCIPIO SOLID S: Responsabilidad de retornar conexión configurada
            return connection;
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Wrapping - Envuelve errores con contexto específico
            // PRINCIPIO SOLID S: Responsabilidad de manejo de errores del método
            console.error('❌ Error al inicializar conexión:', error.message);
            throw error;
        }
    }

    /**
     * Crea índices básicos para optimizar consultas frecuentes
     * @param {Object} db - Instancia de la base de datos
     * 
     * PATRÓN: Template Method - Define el flujo estándar de creación de índices
     * PATRÓN: Strategy - Diferentes estrategias de índices por colección
     * PATRÓN: Iterator - Itera sobre todas las colecciones
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de crear índices
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevos índices
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para índices
     * PRINCIPIO SOLID D: Inversión de Dependencias - No depende de implementaciones externas
     * 
     * NOTA: No hay transacciones ya que solo crea índices
     * BUENA PRÁCTICA: Optimización de consultas con índices estratégicos
     */
    async createIndexes(db) {
        try {
            // ===== ÍNDICES PARA CLIENTES =====
            // PATRÓN: Strategy - Estrategia de índices para clientes
            // BUENA PRÁCTICA: Índices únicos para campos críticos
            await db.collection('clientes').createIndex({ email: 1 }, { unique: true }); // Índice único para email
            await db.collection('clientes').createIndex({ telefono: 1 }); // Índice para búsquedas por teléfono
            await db.collection('clientes').createIndex({ fechaRegistro: 1 }); // Índice para ordenamiento por fecha

            // ===== ÍNDICES PARA PLANES =====
            // PATRÓN: Strategy - Estrategia de índices para planes
            // BUENA PRÁCTICA: Índices para filtros frecuentes
            await db.collection('planes').createIndex({ estado: 1 }); // Índice para filtros por estado
            await db.collection('planes').createIndex({ nivel: 1 }); // Índice para filtros por nivel
            await db.collection('planes').createIndex({ fechaCreacion: 1 }); // Índice para ordenamiento por fecha

            // ===== ÍNDICES PARA CONTRATOS =====
            // PATRÓN: Strategy - Estrategia de índices para contratos
            // BUENA PRÁCTICA: Índices para relaciones y filtros
            await db.collection('contratos').createIndex({ clienteId: 1 }); // Índice para búsquedas por cliente
            await db.collection('contratos').createIndex({ planId: 1 }); // Índice para búsquedas por plan
            await db.collection('contratos').createIndex({ fechaInicio: 1 }); // Índice para ordenamiento por fecha
            await db.collection('contratos').createIndex({ estado: 1 }); // Índice para filtros por estado

            // ===== ÍNDICES PARA SEGUIMIENTOS =====
            // PATRÓN: Strategy - Estrategia de índices para seguimientos
            // BUENA PRÁCTICA: Índices para consultas temporales y por cliente
            await db.collection('seguimientos').createIndex({ clienteId: 1 }); // Índice para búsquedas por cliente
            await db.collection('seguimientos').createIndex({ fecha: 1 }); // Índice para ordenamiento por fecha
            await db.collection('seguimientos').createIndex({ tipo: 1 }); // Índice para filtros por tipo

            // ===== ÍNDICES PARA FINANZAS =====
            // PATRÓN: Strategy - Estrategia de índices para finanzas
            // BUENA PRÁCTICA: Índices para reportes financieros
            await db.collection('finanzas').createIndex({ fecha: 1 }); // Índice para reportes por fecha
            await db.collection('finanzas').createIndex({ tipo: 1 }); // Índice para filtros por tipo
            await db.collection('finanzas').createIndex({ clienteId: 1 }); // Índice para búsquedas por cliente

            // ===== CONFIRMACIÓN DE ÉXITO =====
            // PATRÓN: Observer - Notifica el éxito de la operación
            // PRINCIPIO SOLID S: Responsabilidad de confirmar creación de índices
            console.log('📊 Índices de MongoDB creados exitosamente');
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Wrapping - Envuelve errores con contexto específico
            // PRINCIPIO SOLID S: Responsabilidad de manejo de errores del método
            console.warn('⚠️ Advertencia: No se pudieron crear todos los índices:', error.message);
        }
    }

    /**
     * Obtiene la instancia de la base de datos
     * @returns {Object} Instancia de la base de datos
     * 
     * PATRÓN: Guard Clause - Validación temprana de conexión
     * PATRÓN: Facade - Proporciona acceso a la base de datos
     * PATRÓN: Data Transfer Object (DTO) - Retorna instancia de base de datos
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener la base de datos
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para obtener base de datos
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (DatabaseConfig)
     * 
     * NOTA: No hay transacciones ya que solo obtiene la instancia
     * BUENA PRÁCTICA: Método para acceder a la base de datos de forma segura
     */
    getDatabase() {
        // ===== VALIDACIÓN DE CONEXIÓN =====
        // PATRÓN: Guard Clause - Validación temprana de conexión
        // PRINCIPIO SOLID S: Responsabilidad de validar estado de conexión
        if (!this.isConnected) {
            throw new Error('Base de datos no conectada. Llama a initialize() primero.');
        }
        
        // ===== RETORNO DE BASE DE DATOS =====
        // PATRÓN: Facade - Delega a DatabaseConfig
        // PRINCIPIO SOLID S: Delegación de responsabilidad de base de datos
        return this.dbConfig.getDatabase();
    }

    /**
     * Cierra la conexión con MongoDB
     * 
     * PATRÓN: Template Method - Define el flujo estándar de cierre
     * PATRÓN: State - Actualiza el estado de conexión
     * PATRÓN: Facade - Delega el cierre a DatabaseConfig
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de cerrar conexiones
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para cierre
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (DatabaseConfig)
     * 
     * NOTA: No hay transacciones ya que solo cierra la conexión
     * BUENA PRÁCTICA: Método para cerrar conexiones de forma segura
     */
    async close() {
        // ===== VALIDACIÓN DE CONEXIÓN =====
        // PATRÓN: Guard Clause - Validación temprana de conexión
        // PRINCIPIO SOLID S: Responsabilidad de validar estado de conexión
        if (this.isConnected) {
            // ===== CIERRE DE CONEXIÓN =====
            // PATRÓN: Facade - Delega el cierre a DatabaseConfig
            // PRINCIPIO SOLID S: Delegación de responsabilidad de cierre
            await this.dbConfig.disconnect();
            
            // ===== ACTUALIZACIÓN DE ESTADO =====
            // PATRÓN: State - Actualiza el estado de conexión
            // PRINCIPIO SOLID S: Responsabilidad de mantener estado consistente
            this.isConnected = false;
        }
    }

    /**
     * Verifica el estado de la conexión
     * @returns {boolean} True si está conectado
     * 
     * PATRÓN: State - Consulta el estado de conexión
     * PATRÓN: Facade - Delega verificación a DatabaseConfig
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de verificar estado
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas verificaciones
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para verificación
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (DatabaseConfig)
     * 
     * NOTA: No hay transacciones ya que solo verifica estado
     * BUENA PRÁCTICA: Método para verificar estado de conexión
     */
    getConnectionStatus() {
        // ===== VERIFICACIÓN DE ESTADO =====
        // PATRÓN: State - Consulta el estado de conexión
        // PATRÓN: Facade - Delega verificación a DatabaseConfig
        // PRINCIPIO SOLID S: Responsabilidad de verificar estado completo
        return this.isConnected && this.dbConfig.isConnected();
    }
}

// ===== EXPORTACIÓN DEL MÓDULO =====
// PATRÓN: Singleton - Exporta instancia única del gestor de conexiones
// PATRÓN: Module Pattern - Exporta la instancia como módulo
// PRINCIPIO SOLID S: Responsabilidad de proporcionar la interfaz pública del gestor
module.exports = new ConnectionManager();
