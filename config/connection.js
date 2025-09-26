const DatabaseConfig = require('./database');
const config = require('./index');

/**
 * Singleton para manejar la conexión a MongoDB
 * Asegura una sola instancia de conexión en toda la aplicación
 */
class ConnectionManager {
    constructor() {
        this.dbConfig = new DatabaseConfig();
        this.isConnected = false;
    }

    /**
     * Inicializa la conexión a MongoDB
     * @returns {Promise<Object>} Cliente y base de datos conectados
     */
    async initialize() {
        try {
            if (this.isConnected) {
                return { client: this.dbConfig.client, db: this.dbConfig.db };
            }

            const connection = await this.dbConfig.connect();
            this.isConnected = true;
            
            // Crear índices básicos para optimizar consultas
            await this.createIndexes(connection.db);
            
            return connection;
        } catch (error) {
            console.error('❌ Error al inicializar conexión:', error.message);
            throw error;
        }
    }

    /**
     * Crea índices básicos para optimizar consultas frecuentes
     * @param {Object} db - Instancia de la base de datos
     */
    async createIndexes(db) {
        try {
            // Índices para clientes
            await db.collection('clientes').createIndex({ email: 1 }, { unique: true });
            await db.collection('clientes').createIndex({ telefono: 1 });
            await db.collection('clientes').createIndex({ fechaRegistro: 1 });

            // Índices para planes
            await db.collection('planes').createIndex({ estado: 1 });
            await db.collection('planes').createIndex({ nivel: 1 });
            await db.collection('planes').createIndex({ fechaCreacion: 1 });

            // Índices para contratos
            await db.collection('contratos').createIndex({ clienteId: 1 });
            await db.collection('contratos').createIndex({ planId: 1 });
            await db.collection('contratos').createIndex({ fechaInicio: 1 });
            await db.collection('contratos').createIndex({ estado: 1 });

            // Índices para seguimientos
            await db.collection('seguimientos').createIndex({ clienteId: 1 });
            await db.collection('seguimientos').createIndex({ fecha: 1 });
            await db.collection('seguimientos').createIndex({ tipo: 1 });

            // Índices para finanzas
            await db.collection('finanzas').createIndex({ fecha: 1 });
            await db.collection('finanzas').createIndex({ tipo: 1 });
            await db.collection('finanzas').createIndex({ clienteId: 1 });

            console.log('📊 Índices de MongoDB creados exitosamente');
        } catch (error) {
            console.warn('⚠️ Advertencia: No se pudieron crear todos los índices:', error.message);
        }
    }

    /**
     * Obtiene la instancia de la base de datos
     * @returns {Object} Instancia de la base de datos
     */
    getDatabase() {
        if (!this.isConnected) {
            throw new Error('Base de datos no conectada. Llama a initialize() primero.');
        }
        return this.dbConfig.getDatabase();
    }

    /**
     * Cierra la conexión con MongoDB
     */
    async close() {
        if (this.isConnected) {
            await this.dbConfig.disconnect();
            this.isConnected = false;
        }
    }

    /**
     * Verifica el estado de la conexión
     * @returns {boolean} True si está conectado
     */
    getConnectionStatus() {
        return this.isConnected && this.dbConfig.isConnected();
    }
}

// Exportar instancia singleton
module.exports = new ConnectionManager();
