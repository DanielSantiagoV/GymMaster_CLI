#!/usr/bin/env node

/**
 * GymMaster CLI - Aplicación de gestión de gimnasio
 * Punto de entrada principal de la aplicación
 */

const chalk = require('chalk');
const connectionManager = require('./config/connection');
const config = require('./config');

/**
 * Clase principal de la aplicación
 * Maneja la inicialización y el flujo principal
 */
class GymMasterApp {
    constructor() {
        this.isInitialized = false;
    }

    /**
     * Inicializa la aplicación
     * Configura conexión a MongoDB y valida el entorno
     */
    async initialize() {
        try {
            console.log(chalk.blue.bold('\n🏋️  GymMaster CLI v' + config.app.version));
            console.log(chalk.gray('Inicializando aplicación...\n'));

            // Verificar variables de entorno
            this.validateEnvironment();

            // Conectar a MongoDB
            await connectionManager.initialize();

            this.isInitialized = true;
            console.log(chalk.green('✅ Aplicación inicializada correctamente\n'));

        } catch (error) {
            console.error(chalk.red('❌ Error al inicializar la aplicación:'), error.message);
            process.exit(1);
        }
    }

    /**
     * Valida las variables de entorno necesarias
     */
    validateEnvironment() {
        const requiredVars = ['MONGODB_URI', 'MONGODB_DATABASE'];
        const missingVars = requiredVars.filter(varName => !process.env[varName]);

        if (missingVars.length > 0) {
            console.warn(chalk.yellow('⚠️  Variables de entorno faltantes:'), missingVars.join(', '));
            console.log(chalk.gray('Usando valores por defecto...'));
        }
    }

    /**
     * Muestra el menú principal de la aplicación
     */
    showMainMenu() {
        console.log(chalk.cyan.bold('\n📋 MENÚ PRINCIPAL - GymMaster CLI'));
        console.log(chalk.gray('Selecciona una opción:\n'));
        
        console.log(chalk.white('1. 👥 Gestión de Clientes'));
        console.log(chalk.white('2. 📋 Gestión de Planes'));
        console.log(chalk.white('3. 📊 Seguimiento Físico'));
        console.log(chalk.white('4. 🥗 Nutrición'));
        console.log(chalk.white('5. 📄 Contratos'));
        console.log(chalk.white('6. 💰 Finanzas'));
        console.log(chalk.white('7. 📈 Reportes'));
        console.log(chalk.white('8. ⚙️  Configuración'));
        console.log(chalk.red('9. 🚪 Salir\n'));
    }

    /**
     * Ejecuta la aplicación principal
     */
    async run() {
        if (!this.isInitialized) {
            await this.initialize();
        }

        this.showMainMenu();
        
        // TODO: Implementar lógica de menú interactivo con inquirer
        console.log(chalk.yellow('🚧 Funcionalidad de menú en desarrollo...'));
        console.log(chalk.gray('La Fase 1 está completa. Próximamente: Fase 2 - Modelos y Validaciones'));
    }

    /**
     * Cierra la aplicación de forma segura
     */
    async shutdown() {
        try {
            console.log(chalk.gray('\n🔌 Cerrando aplicación...'));
            await connectionManager.close();
            console.log(chalk.green('✅ Aplicación cerrada correctamente'));
            process.exit(0);
        } catch (error) {
            console.error(chalk.red('❌ Error al cerrar la aplicación:'), error.message);
            process.exit(1);
        }
    }
}

// Manejo de señales del sistema para cierre seguro
process.on('SIGINT', async () => {
    console.log(chalk.yellow('\n⚠️  Interrupción detectada. Cerrando aplicación...'));
    await app.shutdown();
});

process.on('SIGTERM', async () => {
    console.log(chalk.yellow('\n⚠️  Terminación detectada. Cerrando aplicación...'));
    await app.shutdown();
});

// Crear instancia de la aplicación y ejecutar
const app = new GymMasterApp();

// Ejecutar aplicación si es llamada directamente
if (require.main === module) {
    app.run().catch(error => {
        console.error(chalk.red('❌ Error fatal:'), error.message);
        process.exit(1);
    });
}

module.exports = GymMasterApp;
