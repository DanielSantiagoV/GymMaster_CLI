// ===== IMPORTS Y DEPENDENCIAS =====
// Importación del driver oficial de MongoDB
// PATRÓN: Dependency Injection - Se inyectan las dependencias a través del constructor
// PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (MongoClient) no de implementaciones concretas
const { MongoClient } = require('mongodb'); // Driver oficial de MongoDB para operaciones directas
const SimpleDatabase = require('./simple-database'); // Base de datos en memoria como fallback
require('dotenv').config(); // Carga variables de entorno desde archivo .env

/**
 * Configuración de conexión a MongoDB
 * Usa el driver oficial de MongoDB para operaciones directas y control fino
 * 
 * PATRÓN: Strategy - Diferentes estrategias de conexión (MongoDB real vs memoria)
 * PATRÓN: Facade - Proporciona una interfaz unificada para diferentes tipos de base de datos
 * PATRÓN: Fallback - Estrategia alternativa cuando MongoDB no está disponible
 * PATRÓN: Data Transfer Object (DTO) - Proporciona conexión estructurada
 * PRINCIPIO SOLID S: Responsabilidad Única - Se encarga únicamente de la configuración de base de datos
 * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas estrategias de conexión
 * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (MongoClient, SimpleDatabase)
 * 
 * NOTA: Este módulo NO maneja transacciones ya que solo configura la conexión
 * BUENA PRÁCTICA: Configuración flexible de base de datos con fallback
 */
class DatabaseConfig {
    /**
     * Constructor de la configuración de base de datos
     * 
     * PATRÓN: Strategy - Inicializa estrategias de conexión
     * PATRÓN: State - Mantiene el estado de conexión
     * PRINCIPIO SOLID S: Responsabilidad de inicializar la configuración
     * BUENA PRÁCTICA: Inicialización de configuración en constructor
     */
    constructor() {
        // PATRÓN: State - Mantiene el estado del cliente
        // PRINCIPIO SOLID S: Responsabilidad de rastrear el cliente
        this.client = null;
        // PATRÓN: State - Mantiene el estado de la base de datos
        // PRINCIPIO SOLID S: Responsabilidad de rastrear la base de datos
        this.db = null;
        // PATRÓN: Strategy - Configuración de URI con replica set para transacciones
        // BUENA PRÁCTICA: Usar replica set para habilitar transacciones
        this.uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/?replicaSet=rs0';
        // PATRÓN: Strategy - Configuración de nombre de base de datos
        // BUENA PRÁCTICA: Nombre de base de datos configurable
        this.databaseName = process.env.MONGODB_DATABASE || 'gymmaster';
    }

    /**
     * Establece conexión con MongoDB
     * @returns {Promise<Object>} Cliente y base de datos conectados
     * 
     * PATRÓN: Template Method - Define el flujo estándar de conexión
     * PATRÓN: Strategy - Diferentes estrategias de conexión (MongoDB real vs memoria)
     * PATRÓN: Fallback - Estrategia alternativa cuando MongoDB no está disponible
     * PATRÓN: Data Transfer Object (DTO) - Retorna conexión estructurada
     * PATRÓN: Guard Clause - Validaciones tempranas
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de establecer conexiones
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas estrategias de conexión
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para conexión
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (MongoClient, SimpleDatabase)
     * 
     * NOTA: No hay transacciones ya que solo establece la conexión
     * BUENA PRÁCTICA: Método principal que orquesta la conexión con fallback
     */
    async connect() {
        try {
            // ===== INTENTO DE CONEXIÓN A MONGODB REAL =====
            // PATRÓN: Strategy - Estrategia principal de conexión
            // PRINCIPIO SOLID S: Responsabilidad de conectar a MongoDB real
            this.client = new MongoClient(this.uri);
            await this.client.connect();
            this.db = this.client.db(this.databaseName);
            
            // ===== CONFIRMACIÓN DE CONEXIÓN =====
            // PATRÓN: Observer - Notifica el éxito de la conexión
            // PRINCIPIO SOLID S: Responsabilidad de confirmar conexión exitosa
            console.log(`✅ Conectado a MongoDB: ${this.databaseName}`);
            
            // ===== RETORNO DE CONEXIÓN =====
            // PATRÓN: Data Transfer Object (DTO) - Retorna conexión estructurada
            // PRINCIPIO SOLID S: Responsabilidad de retornar conexión configurada
            return { client: this.client, db: this.db };
        } catch (error) {
            // ===== FALLBACK A BASE DE DATOS EN MEMORIA =====
            // PATRÓN: Fallback - Estrategia alternativa cuando MongoDB no está disponible
            // PRINCIPIO SOLID S: Responsabilidad de manejar fallos de conexión
            console.log('⚠️ MongoDB no disponible, usando base de datos en memoria');
            console.log('💡 Para usar MongoDB real, instala MongoDB siguiendo INSTALAR_MONGODB.md');
            
            // ===== CONFIGURACIÓN DE FALLBACK =====
            // PATRÓN: Strategy - Estrategia alternativa de conexión
            // PRINCIPIO SOLID S: Delegación de responsabilidad a SimpleDatabase
            this.client = new SimpleDatabase();
            this.db = this.client;
            
            // ===== CONEXIÓN ALTERNATIVA =====
            // PATRÓN: Facade - Delega conexión a SimpleDatabase
            // PRINCIPIO SOLID S: Delegación de responsabilidad de conexión
            const connection = await this.client.connect();
            return connection;
        }
    }

    /**
     * Cierra la conexión con MongoDB
     * 
     * PATRÓN: Template Method - Define el flujo estándar de desconexión
     * PATRÓN: Strategy - Diferentes estrategias de desconexión según el tipo de cliente
     * PATRÓN: Guard Clause - Validaciones tempranas
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de cerrar conexiones
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas estrategias de desconexión
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para desconexión
     * PRINCIPIO SOLID D: Inversión de Dependencias - No depende de implementaciones externas
     * 
     * NOTA: No hay transacciones ya que solo cierra la conexión
     * BUENA PRÁCTICA: Método para cerrar conexiones de forma segura
     */
    async disconnect() {
        // ===== VALIDACIÓN DE CLIENTE =====
        // PATRÓN: Guard Clause - Validación temprana de existencia del cliente
        // PRINCIPIO SOLID S: Responsabilidad de validar estado del cliente
        if (this.client) {
            // ===== ESTRATEGIA DE DESCONEXIÓN PARA MONGODB REAL =====
            // PATRÓN: Strategy - Estrategia de desconexión para MongoDB real
            // PRINCIPIO SOLID S: Responsabilidad de cerrar conexión MongoDB
            if (this.client.close) {
                await this.client.close();
                console.log('🔌 Conexión a MongoDB cerrada');
            } else {
                // ===== ESTRATEGIA DE DESCONEXIÓN PARA BASE DE DATOS EN MEMORIA =====
                // PATRÓN: Strategy - Estrategia de desconexión para SimpleDatabase
                // PRINCIPIO SOLID S: Responsabilidad de cerrar conexión en memoria
                await this.client.disconnect();
                console.log('🔌 Conexión a base de datos en memoria cerrada');
            }
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
     * PRINCIPIO SOLID D: Inversión de Dependencias - No depende de implementaciones externas
     * 
     * NOTA: No hay transacciones ya que solo obtiene la instancia
     * BUENA PRÁCTICA: Método para acceder a la base de datos de forma segura
     */
    getDatabase() {
        // ===== VALIDACIÓN DE CONEXIÓN =====
        // PATRÓN: Guard Clause - Validación temprana de conexión
        // PRINCIPIO SOLID S: Responsabilidad de validar estado de conexión
        if (!this.db) {
            throw new Error('Base de datos no conectada. Llama a connect() primero.');
        }
        
        // ===== RETORNO DE BASE DE DATOS =====
        // PATRÓN: Facade - Proporciona acceso a la base de datos
        // PRINCIPIO SOLID S: Responsabilidad de retornar instancia de base de datos
        return this.db;
    }

    /**
     * Verifica el estado de la conexión
     * @returns {boolean} True si está conectado
     * 
     * PATRÓN: State - Consulta el estado de conexión
     * PATRÓN: Strategy - Diferentes estrategias de verificación según el tipo de cliente
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de verificar estado
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas verificaciones
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para verificación
     * PRINCIPIO SOLID D: Inversión de Dependencias - No depende de implementaciones externas
     * 
     * NOTA: No hay transacciones ya que solo verifica estado
     * BUENA PRÁCTICA: Método para verificar estado de conexión
     */
    isConnected() {
        // ===== VERIFICACIÓN DE ESTADO =====
        // PATRÓN: State - Consulta el estado de conexión
        // PATRÓN: Strategy - Diferentes estrategias según el tipo de cliente
        // PRINCIPIO SOLID S: Responsabilidad de verificar estado completo
        return this.client && this.client.topology && this.client.topology.isConnected();
    }

    /**
     * Verifica si las transacciones están disponibles
     * @returns {Promise<boolean>} True si las transacciones están disponibles
     * 
     * PATRÓN: Template Method - Define el flujo estándar de verificación de transacciones
     * PATRÓN: Strategy - Diferentes estrategias de verificación según el tipo de cliente
     * PATRÓN: Guard Clause - Validaciones tempranas
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de verificar transacciones
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas verificaciones
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para verificación de transacciones
     * PRINCIPIO SOLID D: Inversión de Dependencias - No depende de implementaciones externas
     * 
     * NOTA: No hay transacciones ya que solo verifica disponibilidad
     * BUENA PRÁCTICA: Método para verificar disponibilidad de transacciones
     */
    async areTransactionsAvailable() {
        try {
            // ===== VALIDACIÓN DE CLIENTE =====
            // PATRÓN: Guard Clause - Validación temprana de existencia del cliente
            // PRINCIPIO SOLID S: Responsabilidad de validar estado del cliente
            if (!this.client) {
                return false;
            }
            
            // ===== VERIFICACIÓN DE TIPO DE BASE DE DATOS =====
            // PATRÓN: Strategy - Diferentes estrategias según el tipo de cliente
            // PRINCIPIO SOLID S: Responsabilidad de verificar tipo de base de datos
            if (this.client.constructor.name === 'SimpleDatabase') {
                return false;
            }
            
            // ===== PRUEBA DE SESIÓN =====
            // PATRÓN: Strategy - Estrategia de prueba de sesión para MongoDB
            // PRINCIPIO SOLID S: Responsabilidad de probar disponibilidad de transacciones
            const session = this.client.startSession();
            await session.endSession();
            return true;
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Wrapping - Envuelve errores con contexto específico
            // PRINCIPIO SOLID S: Responsabilidad de manejo de errores del método
            console.log('⚠️ Transacciones no disponibles:', error.message);
            return false;
        }
    }

    /**
     * Obtiene información del replica set
     * @returns {Promise<Object>} Información del replica set
     * 
     * PATRÓN: Template Method - Define el flujo estándar de obtención de información
     * PATRÓN: Strategy - Estrategia específica para MongoDB replica set
     * PATRÓN: Guard Clause - Validaciones tempranas
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de obtener información del replica set
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para información de replica set
     * PRINCIPIO SOLID D: Inversión de Dependencias - No depende de implementaciones externas
     * 
     * NOTA: No hay transacciones ya que solo obtiene información
     * BUENA PRÁCTICA: Método para obtener información del replica set
     */
    async getReplicaSetInfo() {
        try {
            // ===== VALIDACIÓN DE CLIENTE =====
            // PATRÓN: Guard Clause - Validación temprana de existencia del cliente
            // PRINCIPIO SOLID S: Responsabilidad de validar estado del cliente
            if (!this.client) {
                throw new Error('Cliente no conectado');
            }
            
            // ===== ACCESO A BASE DE DATOS ADMIN =====
            // PATRÓN: Strategy - Estrategia específica para MongoDB replica set
            // PRINCIPIO SOLID S: Responsabilidad de acceder a base de datos admin
            const adminDb = this.client.db('admin');
            
            // ===== COMANDO DE REPLICA SET =====
            // PATRÓN: Strategy - Estrategia de comando específico para replica set
            // PRINCIPIO SOLID S: Responsabilidad de ejecutar comando de replica set
            const status = await adminDb.command({ replSetGetStatus: 1 });
            return status;
        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Wrapping - Envuelve errores con contexto específico
            // PRINCIPIO SOLID S: Responsabilidad de manejo de errores del método
            throw new Error(`Error al obtener información del replica set: ${error.message}`);
        }
    }
}

// ===== EXPORTACIÓN DEL MÓDULO =====
// PATRÓN: Module Pattern - Exporta la clase como módulo
// PRINCIPIO SOLID S: Responsabilidad de proporcionar la interfaz pública de configuración
module.exports = DatabaseConfig;
