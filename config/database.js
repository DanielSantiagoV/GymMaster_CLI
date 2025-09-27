const { MongoClient } = require('mongodb');
const SimpleDatabase = require('./simple-database');
require('dotenv').config();

/**
 * Configuración de conexión a MongoDB
 * Usa el driver oficial de MongoDB para operaciones directas y control fino
 */
class DatabaseConfig {
    constructor() {
        this.client = null;
        this.db = null;
        // Usar replica set para habilitar transacciones
        this.uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/?replicaSet=rs0';
        this.databaseName = process.env.MONGODB_DATABASE || 'gymmaster';
    }

    /**
     * Establece conexión con MongoDB
     * @returns {Promise<Object>} Cliente y base de datos conectados
     */
    async connect() {
        try {
            // Intentar conectar a MongoDB real
            this.client = new MongoClient(this.uri);
            await this.client.connect();
            this.db = this.client.db(this.databaseName);
            
            console.log(`✅ Conectado a MongoDB: ${this.databaseName}`);
            return { client: this.client, db: this.db };
        } catch (error) {
            console.log('⚠️ MongoDB no disponible, usando base de datos en memoria');
            console.log('💡 Para usar MongoDB real, instala MongoDB siguiendo INSTALAR_MONGODB.md');
            
            // Usar base de datos simple
            this.client = new SimpleDatabase();
            this.db = this.client;
            
            const connection = await this.client.connect();
            return connection;
        }
    }

    /**
     * Cierra la conexión con MongoDB
     */
    async disconnect() {
        if (this.client) {
            if (this.client.close) {
                await this.client.close();
                console.log('🔌 Conexión a MongoDB cerrada');
            } else {
                await this.client.disconnect();
                console.log('🔌 Conexión a base de datos en memoria cerrada');
            }
        }
    }

    /**
     * Obtiene la instancia de la base de datos
     * @returns {Object} Instancia de la base de datos
     */
    getDatabase() {
        if (!this.db) {
            throw new Error('Base de datos no conectada. Llama a connect() primero.');
        }
        return this.db;
    }

    /**
     * Verifica el estado de la conexión
     * @returns {boolean} True si está conectado
     */
    isConnected() {
        return this.client && this.client.topology && this.client.topology.isConnected();
    }

    /**
     * Verifica si las transacciones están disponibles
     * @returns {Promise<boolean>} True si las transacciones están disponibles
     */
    async areTransactionsAvailable() {
        try {
            if (!this.client) {
                return false;
            }
            
            // Si es base de datos simple, no hay transacciones
            if (this.client.constructor.name === 'SimpleDatabase') {
                return false;
            }
            
            const session = this.client.startSession();
            await session.endSession();
            return true;
        } catch (error) {
            console.log('⚠️ Transacciones no disponibles:', error.message);
            return false;
        }
    }

    /**
     * Obtiene información del replica set
     * @returns {Promise<Object>} Información del replica set
     */
    async getReplicaSetInfo() {
        try {
            if (!this.client) {
                throw new Error('Cliente no conectado');
            }
            
            const adminDb = this.client.db('admin');
            const status = await adminDb.command({ replSetGetStatus: 1 });
            return status;
        } catch (error) {
            throw new Error(`Error al obtener información del replica set: ${error.message}`);
        }
    }
}

module.exports = DatabaseConfig;
