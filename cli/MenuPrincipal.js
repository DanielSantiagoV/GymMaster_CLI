const inquirer = require('inquirer');
const chalk = require('chalk');
const ClienteCLI = require('./ClienteCLI');

/**
 * Menú Principal del Sistema GymMaster CLI
 * Implementa navegación jerárquica con inquirer y chalk para UX
 */
class MenuPrincipal {
    constructor(db) {
        this.db = db;
        this.clienteCLI = new ClienteCLI(db);
    }

    /**
     * Inicia el menú principal del sistema
     */
    async iniciar() {
        console.log(chalk.blue.bold('\n🏋️  GYMMASTER CLI - Sistema de Gestión de Gimnasio'));
        console.log(chalk.gray('================================================\n'));

        await this.mostrarMenuPrincipal();
    }

    /**
     * Muestra el menú principal con opciones del sistema
     */
    async mostrarMenuPrincipal() {
        const opciones = [
            {
                type: 'list',
                name: 'opcion',
                message: chalk.yellow('¿Qué deseas hacer?'),
                choices: [
                    {
                        name: '👥 Gestión de Clientes',
                        value: 'clientes'
                    },
                    {
                        name: '📋 Gestión de Planes de Entrenamiento',
                        value: 'planes'
                    },
                    {
                        name: '📊 Seguimiento Físico',
                        value: 'seguimiento'
                    },
                    {
                        name: '🍎 Nutrición',
                        value: 'nutricion'
                    },
                    {
                        name: '📄 Contratos',
                        value: 'contratos'
                    },
                    {
                        name: '💰 Finanzas',
                        value: 'finanzas'
                    },
                    {
                        name: '📈 Reportes y Estadísticas',
                        value: 'reportes'
                    },
                    {
                        name: '⚙️  Configuración',
                        value: 'configuracion'
                    },
                    {
                        name: '❌ Salir',
                        value: 'salir'
                    }
                ]
            }
        ];

        const respuesta = await inquirer.prompt(opciones);

        switch (respuesta.opcion) {
            case 'clientes':
                await this.clienteCLI.mostrarMenuClientes();
                // Volver al menú principal después de gestionar clientes
                await this.mostrarMenuPrincipal();
                break;
            case 'planes':
                await this.mostrarMenuPlanes();
                break;
            case 'seguimiento':
                await this.mostrarMenuSeguimiento();
                break;
            case 'nutricion':
                await this.mostrarMenuNutricion();
                break;
            case 'contratos':
                await this.mostrarMenuContratos();
                break;
            case 'finanzas':
                await this.mostrarMenuFinanzas();
                break;
            case 'reportes':
                await this.mostrarMenuReportes();
                break;
            case 'configuracion':
                await this.mostrarMenuConfiguracion();
                break;
            case 'salir':
                await this.salir();
                break;
        }
    }

    /**
     * Muestra el menú de gestión de planes (placeholder)
     */
    async mostrarMenuPlanes() {
        console.log(chalk.yellow('\n📋 Gestión de Planes de Entrenamiento'));
        console.log(chalk.gray('Esta funcionalidad estará disponible próximamente...\n'));
        
        const continuar = await inquirer.prompt([{
            type: 'confirm',
            name: 'continuar',
            message: '¿Deseas volver al menú principal?',
            default: true
        }]);

        if (continuar.continuar) {
            await this.mostrarMenuPrincipal();
        }
    }

    /**
     * Muestra el menú de seguimiento físico (placeholder)
     */
    async mostrarMenuSeguimiento() {
        console.log(chalk.yellow('\n📊 Seguimiento Físico'));
        console.log(chalk.gray('Esta funcionalidad estará disponible próximamente...\n'));
        
        const continuar = await inquirer.prompt([{
            type: 'confirm',
            name: 'continuar',
            message: '¿Deseas volver al menú principal?',
            default: true
        }]);

        if (continuar.continuar) {
            await this.mostrarMenuPrincipal();
        }
    }

    /**
     * Muestra el menú de nutrición (placeholder)
     */
    async mostrarMenuNutricion() {
        console.log(chalk.yellow('\n🍎 Nutrición'));
        console.log(chalk.gray('Esta funcionalidad estará disponible próximamente...\n'));
        
        const continuar = await inquirer.prompt([{
            type: 'confirm',
            name: 'continuar',
            message: '¿Deseas volver al menú principal?',
            default: true
        }]);

        if (continuar.continuar) {
            await this.mostrarMenuPrincipal();
        }
    }

    /**
     * Muestra el menú de contratos (placeholder)
     */
    async mostrarMenuContratos() {
        console.log(chalk.yellow('\n📄 Contratos'));
        console.log(chalk.gray('Esta funcionalidad estará disponible próximamente...\n'));
        
        const continuar = await inquirer.prompt([{
            type: 'confirm',
            name: 'continuar',
            message: '¿Deseas volver al menú principal?',
            default: true
        }]);

        if (continuar.continuar) {
            await this.mostrarMenuPrincipal();
        }
    }

    /**
     * Muestra el menú de finanzas (placeholder)
     */
    async mostrarMenuFinanzas() {
        console.log(chalk.yellow('\n💰 Finanzas'));
        console.log(chalk.gray('Esta funcionalidad estará disponible próximamente...\n'));
        
        const continuar = await inquirer.prompt([{
            type: 'confirm',
            name: 'continuar',
            message: '¿Deseas volver al menú principal?',
            default: true
        }]);

        if (continuar.continuar) {
            await this.mostrarMenuPrincipal();
        }
    }

    /**
     * Muestra el menú de reportes (placeholder)
     */
    async mostrarMenuReportes() {
        console.log(chalk.yellow('\n📈 Reportes y Estadísticas'));
        console.log(chalk.gray('Esta funcionalidad estará disponible próximamente...\n'));
        
        const continuar = await inquirer.prompt([{
            type: 'confirm',
            name: 'continuar',
            message: '¿Deseas volver al menú principal?',
            default: true
        }]);

        if (continuar.continuar) {
            await this.mostrarMenuPrincipal();
        }
    }

    /**
     * Muestra el menú de configuración (placeholder)
     */
    async mostrarMenuConfiguracion() {
        console.log(chalk.yellow('\n⚙️  Configuración'));
        console.log(chalk.gray('Esta funcionalidad estará disponible próximamente...\n'));
        
        const continuar = await inquirer.prompt([{
            type: 'confirm',
            name: 'continuar',
            message: '¿Deseas volver al menú principal?',
            default: true
        }]);

        if (continuar.continuar) {
            await this.mostrarMenuPrincipal();
        }
    }

    /**
     * Maneja la salida del sistema
     */
    async salir() {
        console.log(chalk.green('\n✅ ¡Gracias por usar GymMaster CLI!'));
        console.log(chalk.gray('Hasta la próxima...\n'));
        process.exit(0);
    }
}

module.exports = MenuPrincipal;
