const { MongoClient } = require('mongodb');
require('dotenv').config();
const MenuPrincipal = require('./MenuPrincipal');

/**
 * Punto de entrada principal de la aplicación CLI
 * Maneja la conexión a MongoDB y el inicio del menú principal
 */
class GymMasterCLI {
    constructor() {
        this.db = null;
        this.client = null;
    }

    /**
     * Inicia la aplicación CLI
     */
    async iniciar() {
        try {
            console.log('🏋️  Iniciando GymMaster CLI...\n');
            
            // Conectar a MongoDB
            await this.conectarMongoDB();
            
            // Iniciar menú principal
            const menuPrincipal = new MenuPrincipal(this.db);
            await menuPrincipal.iniciar();
            
        } catch (error) {
            console.error('❌ Error al iniciar la aplicación:', error.message);
            process.exit(1);
        }
    }

    /**
     * Establece conexión con MongoDB
     */
    async conectarMongoDB() {
        try {
            const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/gymmaster';
            
            console.log('🔌 Conectando a MongoDB...');
            
            this.client = new MongoClient(mongoUrl);

            await this.client.connect();
            this.db = this.client.db('gymmaster');

            // Verificar conexión
            await this.db.admin().ping();
            
            console.log('✅ Conexión a MongoDB establecida correctamente\n');
            
        } catch (error) {
            console.error('❌ Error al conectar con MongoDB:', error.message);
            console.log('💡 Asegúrate de que MongoDB esté ejecutándose y la URL sea correcta');
            throw error;
        }
    }

    /**
     * Cierra la conexión a MongoDB
     */
    async cerrar() {
        if (this.client) {
            await this.client.close();
            console.log('🔌 Conexión a MongoDB cerrada');
        }
    }
}

// Manejar cierre graceful de la aplicación
process.on('SIGINT', async () => {
    console.log('\n👋 Cerrando aplicación...');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n👋 Cerrando aplicación...');
    process.exit(0);
});

// Iniciar la aplicación
if (require.main === module) {
    const app = new GymMasterCLI();
    app.iniciar().catch(error => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });
}

module.exports = GymMasterCLI;
