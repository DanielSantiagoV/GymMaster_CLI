#!/usr/bin/env node

/**
 * GymMaster CLI - Aplicación de gestión de gimnasio
 * Punto de entrada principal de la aplicación
 */

const chalk = require('chalk');
const connectionManager = require('./config/connection');
const config = require('./config');
const GymMasterCLI = require('./cli');

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
     * Muestra el arte ASCII del banner principal
     */
    showBanner() {
        console.clear();
        console.log(chalk.cyan.bold(`
    ╔══════════════════════════════════════════════════════════════════════════════╗
    ║                                                                              ║
    ║    ██████╗ ██╗   ██╗███╗   ███╗    ███╗   ███╗ █████╗ ███████╗████████╗███████╗██████╗ ║
    ║   ██╔════╝ ╚██╗ ██╔╝████╗ ████║    ████╗ ████║██╔══██╗██╔════╝╚══██╔══╝██╔════╝██╔══██╗║
    ║   ██║  ███╗ ╚████╔╝ ██╔████╔██║    ██╔████╔██║███████║███████╗   ██║   █████╗  ██████╔╝║
    ║   ██║   ██║  ╚██╔╝  ██║╚██╔╝██║    ██║╚██╔╝██║██╔══██║╚════██║   ██║   ██╔══╝  ██╔══██╗║
    ║   ╚██████╔╝   ██║   ██║ ╚═╝ ██║    ██║ ╚═╝ ██║██║  ██║███████║   ██║   ███████╗██║  ██║║
    ║    ╚═════╝    ╚═╝   ╚═╝     ╚═╝    ╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝║
    ║                                                                              ║
    ║                           🏋️  CLI - Sistema de Gestión de Gimnasio 🏋️        ║
    ║                                                                              ║
    ╚══════════════════════════════════════════════════════════════════════════════╝
        `));
        
        console.log(chalk.yellow.bold('    ═══════════════════════════════════════════════════════════════════════════════'));
        console.log(chalk.gray('    🚀 Versión: 1.0.0 | 💪 Potencia tu gimnasio con tecnología avanzada'));
        console.log(chalk.yellow.bold('    ═══════════════════════════════════════════════════════════════════════════════\n'));
    }

    /**
     * Muestra el menú principal de la aplicación con diseño visual mejorado
     */
    showMainMenu() {
        console.log(chalk.cyan.bold('    ┌─────────────────────────────────────────────────────────────────────────────┐'));
        console.log(chalk.cyan.bold('    │') + chalk.white.bold('                        📋 MENÚ PRINCIPAL                        ') + chalk.cyan.bold('│'));
        console.log(chalk.cyan.bold('    └─────────────────────────────────────────────────────────────────────────────┘\n'));
        
        console.log(chalk.gray('    ┌─────────────────────────────────────────────────────────────────────────────┐'));
        console.log(chalk.gray('    │') + chalk.white('  Selecciona una opción del menú:                                    ') + chalk.gray('│'));
        console.log(chalk.gray('    └─────────────────────────────────────────────────────────────────────────────┘\n'));
        
        // Opciones del menú con diseño visual
        console.log(chalk.blue.bold('    ┌─ GESTIÓN DE USUARIOS ─────────────────────────────────────────────────────┐'));
        console.log(chalk.white('    │ 1. 👥 Gestión de Clientes                                          │'));
        console.log(chalk.white('    │ 2. 📋 Gestión de Planes de Entrenamiento                          │'));
        console.log(chalk.blue.bold('    └──────────────────────────────────────────────────────────────────────┘\n'));
        
        console.log(chalk.green.bold('    ┌─ SEGUIMIENTO Y NUTRICIÓN ───────────────────────────────────────────────┐'));
        console.log(chalk.white('    │ 3. 📊 Seguimiento Físico y Progreso                               │'));
        console.log(chalk.white('    │ 4. 🥗 Planes de Nutrición                                         │'));
        console.log(chalk.green.bold('    └──────────────────────────────────────────────────────────────────────┘\n'));
        
        console.log(chalk.magenta.bold('    ┌─ CONTRATOS Y FINANZAS ──────────────────────────────────────────────────┐'));
        console.log(chalk.white('    │ 5. 📄 Gestión de Contratos                                        │'));
        console.log(chalk.white('    │ 6. 💰 Control Financiero                                          │'));
        console.log(chalk.magenta.bold('    └──────────────────────────────────────────────────────────────────────┘\n'));
        
        console.log(chalk.yellow.bold('    ┌─ REPORTES Y CONFIGURACIÓN ──────────────────────────────────────────────┐'));
        console.log(chalk.white('    │ 7. 📈 Reportes y Estadísticas                                     │'));
        console.log(chalk.white('    │ 8. ⚙️  Configuración del Sistema                                   │'));
        console.log(chalk.yellow.bold('    └──────────────────────────────────────────────────────────────────────┘\n'));
        
        console.log(chalk.red.bold('    ┌─ SALIR ──────────────────────────────────────────────────────────────────┐'));
        console.log(chalk.white('    │ 9. 🚪 Salir del Sistema                                            │'));
        console.log(chalk.red.bold('    └──────────────────────────────────────────────────────────────────────┘\n'));
        
        console.log(chalk.gray('    ═══════════════════════════════════════════════════════════════════════════════'));
        console.log(chalk.cyan('    💡 Tip: Usa las teclas numéricas para navegar por el menú'));
        console.log(chalk.gray('    ═══════════════════════════════════════════════════════════════════════════════\n'));
    }

    /**
     * Muestra una animación de carga inicial
     */
    async showLoadingAnimation() {
        const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
        let frameIndex = 0;
        
        console.log(chalk.blue('    Inicializando sistema...'));
        
        const interval = setInterval(() => {
            process.stdout.write(`\r    ${chalk.cyan(frames[frameIndex])} Cargando módulos del sistema...`);
            frameIndex = (frameIndex + 1) % frames.length;
        }, 100);
        
        // Simular tiempo de carga
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        clearInterval(interval);
        process.stdout.write('\r' + ' '.repeat(50) + '\r');
    }

    /**
     * Muestra mensaje de bienvenida con efectos visuales
     */
    showWelcomeMessage() {
        console.log(chalk.green.bold('\n    ╔══════════════════════════════════════════════════════════════════════════════╗'));
        console.log(chalk.green.bold('    ║') + chalk.white.bold('                    🎉 ¡BIENVENIDO A GYMMASTER CLI! 🎉                    ') + chalk.green.bold('║'));
        console.log(chalk.green.bold('    ╚══════════════════════════════════════════════════════════════════════════════╝'));
        
        console.log(chalk.cyan('\n    🌟 Características principales:'));
        console.log(chalk.white('    • 👥 Gestión completa de clientes'));
        console.log(chalk.white('    • 📋 Planes de entrenamiento personalizados'));
        console.log(chalk.white('    • 📊 Seguimiento de progreso en tiempo real'));
        console.log(chalk.white('    • 🥗 Control nutricional avanzado'));
        console.log(chalk.white('    • 💰 Gestión financiera integrada'));
        console.log(chalk.white('    • 📈 Reportes y estadísticas detalladas\n'));
        
        console.log(chalk.yellow('    ⚡ Sistema listo para usar. ¡Comencemos! ⚡\n'));
    }

    /**
     * Ejecuta la aplicación principal
     */
    async run() {
        if (!this.isInitialized) {
            await this.initialize();
        }

        // Mostrar banner principal
        this.showBanner();
        
        // Mostrar animación de carga
        await this.showLoadingAnimation();
        
        // Mostrar mensaje de bienvenida
        this.showWelcomeMessage();
        
        // Iniciar interfaz CLI interactiva
        console.log(chalk.green('🚀 Iniciando interfaz CLI interactiva...\n'));
        
        try {
            const cli = new GymMasterCLI();
            await cli.iniciar();
        } catch (error) {
            console.error(chalk.red('❌ Error en la interfaz CLI:'), error.message);
            throw error;
        }
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
