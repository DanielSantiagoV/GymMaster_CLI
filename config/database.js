const { MongoClient } = require('mongodb');
require('dotenv').config();

/**
 * Configuración de conexión a MongoDB
 * Usa el driver oficial de MongoDB para operaciones directas y control fino
 */
class DatabaseConfig {
    constructor() {
        this.client = null;
        this.db = null;
        this.uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
        this.databaseName = process.env.MONGODB_DATABASE || 'gymmaster';
    }

    /**
     * Establece conexión con MongoDB
     * @returns {Promise<Object>} Cliente y base de datos conectados
     */
    async connect() {
        try {
            this.client = new MongoClient(this.uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });

            await this.client.connect();
            this.db = this.client.db(this.databaseName);
            
            console.log(`✅ Conectado a MongoDB: ${this.databaseName}`);
            return { client: this.client, db: this.db };
        } catch (error) {
            console.error('❌ Error al conectar con MongoDB:', error.message);
            throw error;
        }
    }

    /**
     * Cierra la conexión con MongoDB
     */
    async disconnect() {
        if (this.client) {
            await this.client.close();
            console.log('🔌 Conexión a MongoDB cerrada');
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
}

module.exports = DatabaseConfig;
