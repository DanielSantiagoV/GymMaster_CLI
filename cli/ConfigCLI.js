const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');

/**
 * CLI para gestión de configuración del sistema
 * Permite configurar MongoDB, variables de entorno y ajustes del sistema
 */
class ConfigCLI {
    constructor(db) {
        this.db = db;
        this.configPath = path.join(process.cwd(), '.env');
    }

    /**
     * Muestra el menú principal de configuración
     */
    async mostrarMenuConfiguracion() {
        this.limpiarPantalla();
        console.log(chalk.blue('⚙️ CONFIGURACIÓN DEL SISTEMA'));
        console.log(chalk.gray('================================\n'));

        const opciones = [
            {
                type: 'list',
                name: 'opcion',
                message: chalk.yellow('¿Qué desea configurar?'),
                choices: [
                    { name: '🔗 Configuración de Base de Datos', value: 'database' },
                    { name: '🌐 Variables de Entorno', value: 'env' },
                    { name: '📊 Índices de MongoDB', value: 'indexes' },
                    { name: '🧪 Probar Conexión', value: 'test' },
                    { name: '📁 Abrir Carpeta de Configuración', value: 'folder' },
                    { name: '🔄 Reiniciar Sistema', value: 'restart' },
                    { name: '📋 Ver Estado del Sistema', value: 'status' },
                    { name: '🔙 Volver al Menú Principal', value: 'volver' }
                ],
                pageSize: 10
            }
        ];

        const respuesta = await inquirer.prompt(opciones);

        switch (respuesta.opcion) {
            case 'database':
                await this.configurarBaseDatos();
                break;
            case 'env':
                await this.configurarVariablesEntorno();
                break;
            case 'indexes':
                await this.gestionarIndices();
                break;
            case 'test':
                await this.probarConexion();
                break;
            case 'folder':
                await this.abrirCarpetaConfiguracion();
                break;
            case 'restart':
                await this.reiniciarSistema();
                break;
            case 'status':
                await this.verEstadoSistema();
                break;
            case 'volver':
                this.limpiarPantalla();
                console.log(chalk.green('✅ Regresando al menú principal...\n'));
                return;
        }

        // Volver al menú de configuración
        await this.mostrarMenuConfiguracion();
    }

    /**
     * Configura la base de datos
     */
    async configurarBaseDatos() {
        this.limpiarPantalla();
        console.log(chalk.blue('🔗 CONFIGURACIÓN DE BASE DE DATOS'));
        console.log(chalk.gray('==================================\n'));

        const opciones = [
            {
                type: 'list',
                name: 'opcion',
                message: chalk.yellow('¿Qué desea hacer?'),
                choices: [
                    { name: '📝 Configurar Conexión MongoDB', value: 'connection' },
                    { name: '🔧 Configurar Replica Set', value: 'replica' },
                    { name: '📊 Crear Índices', value: 'create_indexes' },
                    { name: '🗑️ Eliminar Índices', value: 'drop_indexes' },
                    { name: '📋 Ver Estado de Conexión', value: 'status' },
                    { name: '🔙 Volver', value: 'volver' }
                ]
            }
        ];

        const respuesta = await inquirer.prompt(opciones);

        switch (respuesta.opcion) {
            case 'connection':
                await this.configurarConexionMongoDB();
                break;
            case 'replica':
                await this.configurarReplicaSet();
                break;
            case 'create_indexes':
                await this.crearIndices();
                break;
            case 'drop_indexes':
                await this.eliminarIndices();
                break;
            case 'status':
                await this.verEstadoConexion();
                break;
            case 'volver':
                return;
        }

        await this.pausar();
    }

    /**
     * Configura la conexión a MongoDB
     */
    async configurarConexionMongoDB() {
        console.log(chalk.cyan('\n📝 CONFIGURACIÓN DE CONEXIÓN MONGODB\n'));

        const configuracion = await inquirer.prompt([
            {
                type: 'input',
                name: 'uri',
                message: '🔗 URI de MongoDB:',
                default: 'mongodb://localhost:27017',
                validate: (input) => {
                    if (!input || input.trim() === '') {
                        return '❌ La URI es obligatoria';
                    }
                    return true;
                }
            },
            {
                type: 'input',
                name: 'database',
                message: '📊 Nombre de la base de datos:',
                default: 'gymmaster',
                validate: (input) => {
                    if (!input || input.trim() === '') {
                        return '❌ El nombre de la base de datos es obligatorio';
                    }
                    return true;
                }
            },
            {
                type: 'confirm',
                name: 'guardar',
                message: '💾 ¿Guardar configuración en archivo .env?',
                default: true
            }
        ]);

        if (configuracion.guardar) {
            await this.guardarConfiguracion({
                MONGODB_URI: configuracion.uri,
                MONGODB_DATABASE: configuracion.database
            });
        }

        console.log(chalk.green('\n✅ Configuración de conexión completada'));
    }

    /**
     * Configura el Replica Set
     */
    async configurarReplicaSet() {
        console.log(chalk.cyan('\n🔧 CONFIGURACIÓN DE REPLICA SET\n'));

        const { ejecutar } = await inquirer.prompt([{
            type: 'confirm',
            name: 'ejecutar',
            message: '🚀 ¿Ejecutar script de configuración de Replica Set?',
            default: true
        }]);

        if (ejecutar) {
            console.log(chalk.yellow('\n⏳ Ejecutando configuración de Replica Set...'));
            
            try {
                const { spawn } = require('child_process');
                const scriptPath = path.join(process.cwd(), 'scripts', 'setup-replica-set.js');
                
                if (fs.existsSync(scriptPath)) {
                    const child = spawn('node', [scriptPath], { stdio: 'inherit' });
                    
                    child.on('close', (code) => {
                        if (code === 0) {
                            console.log(chalk.green('\n✅ Replica Set configurado exitosamente'));
                        } else {
                            console.log(chalk.red('\n❌ Error al configurar Replica Set'));
                        }
                    });
                } else {
                    console.log(chalk.yellow('⚠️ Script de configuración no encontrado'));
                }
            } catch (error) {
                console.log(chalk.red(`❌ Error: ${error.message}`));
            }
        }
    }

    /**
     * Crea índices de MongoDB
     */
    async crearIndices() {
        console.log(chalk.cyan('\n📊 CREANDO ÍNDICES DE MONGODB\n'));

        try {
            const { ConnectionManager } = require('../config/connection');
            const connectionManager = new ConnectionManager();
            
            console.log(chalk.yellow('⏳ Creando índices...'));
            await connectionManager.createIndexes(this.db);
            
            console.log(chalk.green('✅ Índices creados exitosamente'));
        } catch (error) {
            console.log(chalk.red(`❌ Error al crear índices: ${error.message}`));
        }
    }

    /**
     * Elimina índices de MongoDB
     */
    async eliminarIndices() {
        console.log(chalk.cyan('\n🗑️ ELIMINANDO ÍNDICES DE MONGODB\n'));

        const { confirmar } = await inquirer.prompt([{
            type: 'confirm',
            name: 'confirmar',
            message: '⚠️ ¿Está seguro de eliminar todos los índices?',
            default: false
        }]);

        if (confirmar) {
            try {
                const collections = ['clientes', 'planes', 'contratos', 'seguimientos', 'finanzas', 'pagos', 'nutricion'];
                
                for (const collectionName of collections) {
                    try {
                        await this.db.collection(collectionName).dropIndexes();
                        console.log(chalk.green(`✅ Índices eliminados de ${collectionName}`));
                    } catch (error) {
                        console.log(chalk.yellow(`⚠️ No se pudieron eliminar índices de ${collectionName}: ${error.message}`));
                    }
                }
                
                console.log(chalk.green('\n✅ Proceso de eliminación completado'));
            } catch (error) {
                console.log(chalk.red(`❌ Error al eliminar índices: ${error.message}`));
            }
        }
    }

    /**
     * Ver estado de la conexión
     */
    async verEstadoConexion() {
        console.log(chalk.cyan('\n📋 ESTADO DE CONEXIÓN\n'));

        try {
            // Verificar conexión
            const admin = this.db.admin();
            const serverStatus = await admin.serverStatus();
            
            console.log(chalk.green('✅ Conexión activa'));
            console.log(chalk.blue(`📊 Host: ${serverStatus.host}`));
            console.log(chalk.blue(`🔢 Puerto: ${serverStatus.port}`));
            console.log(chalk.blue(`📅 Versión: ${serverStatus.version}`));
            console.log(chalk.blue(`⏱️ Uptime: ${Math.floor(serverStatus.uptime / 60)} minutos`));

            // Verificar colecciones
            const collections = await this.db.listCollections().toArray();
            console.log(chalk.blue(`📁 Colecciones: ${collections.length}`));
            
            for (const collection of collections) {
                const count = await this.db.collection(collection.name).countDocuments();
                console.log(chalk.gray(`  • ${collection.name}: ${count} documentos`));
            }

        } catch (error) {
            console.log(chalk.red(`❌ Error al verificar conexión: ${error.message}`));
        }
    }

    /**
     * Configura variables de entorno
     */
    async configurarVariablesEntorno() {
        this.limpiarPantalla();
        console.log(chalk.blue('🌐 CONFIGURACIÓN DE VARIABLES DE ENTORNO'));
        console.log(chalk.gray('==========================================\n'));

        const opciones = [
            {
                type: 'list',
                name: 'opcion',
                message: chalk.yellow('¿Qué desea hacer?'),
                choices: [
                    { name: '📝 Editar archivo .env', value: 'edit' },
                    { name: '📋 Ver variables actuales', value: 'view' },
                    { name: '🔄 Recargar variables', value: 'reload' },
                    { name: '📁 Abrir archivo .env', value: 'open' },
                    { name: '🔙 Volver', value: 'volver' }
                ]
            }
        ];

        const respuesta = await inquirer.prompt(opciones);

        switch (respuesta.opcion) {
            case 'edit':
                await this.editarVariablesEntorno();
                break;
            case 'view':
                await this.verVariablesEntorno();
                break;
            case 'reload':
                await this.recargarVariables();
                break;
            case 'open':
                await this.abrirArchivoEnv();
                break;
            case 'volver':
                return;
        }

        await this.pausar();
    }

    /**
     * Edita variables de entorno
     */
    async editarVariablesEntorno() {
        console.log(chalk.cyan('\n📝 EDITAR VARIABLES DE ENTORNO\n'));

        const variables = await inquirer.prompt([
            {
                type: 'input',
                name: 'MONGODB_URI',
                message: '🔗 MONGODB_URI:',
                default: process.env.MONGODB_URI || 'mongodb://localhost:27017'
            },
            {
                type: 'input',
                name: 'MONGODB_DATABASE',
                message: '📊 MONGODB_DATABASE:',
                default: process.env.MONGODB_DATABASE || 'gymmaster'
            },
            {
                type: 'input',
                name: 'NODE_ENV',
                message: '🌍 NODE_ENV:',
                default: process.env.NODE_ENV || 'development'
            },
            {
                type: 'input',
                name: 'LOG_LEVEL',
                message: '📝 LOG_LEVEL:',
                default: process.env.LOG_LEVEL || 'info'
            }
        ]);

        await this.guardarConfiguracion(variables);
        console.log(chalk.green('\n✅ Variables de entorno actualizadas'));
    }

    /**
     * Ver variables de entorno actuales
     */
    async verVariablesEntorno() {
        console.log(chalk.cyan('\n📋 VARIABLES DE ENTORNO ACTUALES\n'));

        const variables = {
            'MONGODB_URI': process.env.MONGODB_URI || 'No configurado',
            'MONGODB_DATABASE': process.env.MONGODB_DATABASE || 'No configurado',
            'NODE_ENV': process.env.NODE_ENV || 'No configurado',
            'LOG_LEVEL': process.env.LOG_LEVEL || 'No configurado',
            'APP_NAME': process.env.APP_NAME || 'GymMaster CLI',
            'APP_VERSION': process.env.APP_VERSION || '1.0.0'
        };

        for (const [key, value] of Object.entries(variables)) {
            const status = value === 'No configurado' ? chalk.red(value) : chalk.green(value);
            console.log(chalk.blue(`${key}:`), status);
        }
    }

    /**
     * Recargar variables de entorno
     */
    async recargarVariables() {
        console.log(chalk.cyan('\n🔄 RECARGANDO VARIABLES DE ENTORNO\n'));

        try {
            delete require.cache[require.resolve('dotenv')];
            require('dotenv').config();
            
            console.log(chalk.green('✅ Variables de entorno recargadas'));
        } catch (error) {
            console.log(chalk.red(`❌ Error al recargar variables: ${error.message}`));
        }
    }

    /**
     * Abrir archivo .env
     */
    async abrirArchivoEnv() {
        console.log(chalk.cyan('\n📁 ABRIENDO ARCHIVO .ENV\n'));

        try {
            const filePath = path.join(process.cwd(), '.env');
            
            if (fs.existsSync(filePath)) {
                const { exec } = require('child_process');
                const os = require('os');
                
                let comando;
                if (os.platform() === 'win32') {
                    comando = `notepad "${filePath}"`;
                } else if (os.platform() === 'darwin') {
                    comando = `open "${filePath}"`;
                } else {
                    comando = `xdg-open "${filePath}"`;
                }
                
                exec(comando, (error) => {
                    if (error) {
                        console.log(chalk.yellow(`⚠️ No se pudo abrir el archivo automáticamente`));
                        console.log(chalk.gray(`📁 Ubicación: ${filePath}`));
                    } else {
                        console.log(chalk.green(`📁 Archivo abierto: ${filePath}`));
                    }
                });
            } else {
                console.log(chalk.yellow('⚠️ Archivo .env no encontrado'));
                console.log(chalk.gray('💡 Se creará automáticamente al guardar configuración'));
            }
        } catch (error) {
            console.log(chalk.red(`❌ Error al abrir archivo: ${error.message}`));
        }
    }

    /**
     * Gestionar índices
     */
    async gestionarIndices() {
        this.limpiarPantalla();
        console.log(chalk.blue('📊 GESTIÓN DE ÍNDICES MONGODB'));
        console.log(chalk.gray('================================\n'));

        const opciones = [
            {
                type: 'list',
                name: 'opcion',
                message: chalk.yellow('¿Qué desea hacer?'),
                choices: [
                    { name: '📊 Ver índices existentes', value: 'list' },
                    { name: '➕ Crear índices', value: 'create' },
                    { name: '🗑️ Eliminar índices', value: 'drop' },
                    { name: '🔄 Recrear todos los índices', value: 'recreate' },
                    { name: '📈 Estadísticas de índices', value: 'stats' },
                    { name: '🔙 Volver', value: 'volver' }
                ]
            }
        ];

        const respuesta = await inquirer.prompt(opciones);

        switch (respuesta.opcion) {
            case 'list':
                await this.listarIndices();
                break;
            case 'create':
                await this.crearIndices();
                break;
            case 'drop':
                await this.eliminarIndices();
                break;
            case 'recreate':
                await this.recrearIndices();
                break;
            case 'stats':
                await this.verEstadisticasIndices();
                break;
            case 'volver':
                return;
        }

        await this.pausar();
    }

    /**
     * Listar índices existentes
     */
    async listarIndices() {
        console.log(chalk.cyan('\n📊 ÍNDICES EXISTENTES\n'));

        try {
            const collections = ['clientes', 'planes', 'contratos', 'seguimientos', 'finanzas', 'pagos', 'nutricion'];
            
            for (const collectionName of collections) {
                try {
                    const indexes = await this.db.collection(collectionName).listIndexes().toArray();
                    console.log(chalk.blue(`\n📁 ${collectionName}:`));
                    
                    if (indexes.length === 0) {
                        console.log(chalk.gray('  • Sin índices personalizados'));
                    } else {
                        indexes.forEach(index => {
                            const keys = Object.keys(index.key).join(', ');
                            const unique = index.unique ? ' (único)' : '';
                            console.log(chalk.gray(`  • ${index.name}: ${keys}${unique}`));
                        });
                    }
                } catch (error) {
                    console.log(chalk.yellow(`⚠️ Error al listar índices de ${collectionName}: ${error.message}`));
                }
            }
        } catch (error) {
            console.log(chalk.red(`❌ Error al listar índices: ${error.message}`));
        }
    }

    /**
     * Recrear todos los índices
     */
    async recrearIndices() {
        console.log(chalk.cyan('\n🔄 RECREANDO ÍNDICES\n'));

        const { confirmar } = await inquirer.prompt([{
            type: 'confirm',
            name: 'confirmar',
            message: '⚠️ ¿Eliminar y recrear todos los índices?',
            default: false
        }]);

        if (confirmar) {
            try {
                // Primero eliminar
                await this.eliminarIndices();
                
                // Luego crear
                await this.crearIndices();
                
                console.log(chalk.green('\n✅ Índices recreados exitosamente'));
            } catch (error) {
                console.log(chalk.red(`❌ Error al recrear índices: ${error.message}`));
            }
        }
    }

    /**
     * Ver estadísticas de índices
     */
    async verEstadisticasIndices() {
        console.log(chalk.cyan('\n📈 ESTADÍSTICAS DE ÍNDICES\n'));

        try {
            const collections = ['clientes', 'planes', 'contratos', 'seguimientos', 'finanzas', 'pagos', 'nutricion'];
            
            for (const collectionName of collections) {
                try {
                    const stats = await this.db.collection(collectionName).stats();
                    console.log(chalk.blue(`\n📁 ${collectionName}:`));
                    console.log(chalk.gray(`  • Documentos: ${stats.count}`));
                    console.log(chalk.gray(`  • Tamaño: ${(stats.size / 1024).toFixed(2)} KB`));
                    console.log(chalk.gray(`  • Índices: ${stats.nindexes}`));
                    console.log(chalk.gray(`  • Tamaño índices: ${(stats.totalIndexSize / 1024).toFixed(2)} KB`));
                } catch (error) {
                    console.log(chalk.yellow(`⚠️ Error al obtener estadísticas de ${collectionName}: ${error.message}`));
                }
            }
        } catch (error) {
            console.log(chalk.red(`❌ Error al obtener estadísticas: ${error.message}`));
        }
    }

    /**
     * Probar conexión
     */
    async probarConexion() {
        console.log(chalk.cyan('\n🧪 PROBANDO CONEXIÓN\n'));

        try {
            console.log(chalk.yellow('⏳ Verificando conexión...'));
            
            // Probar conexión básica
            const admin = this.db.admin();
            const serverStatus = await admin.serverStatus();
            
            console.log(chalk.green('✅ Conexión exitosa'));
            console.log(chalk.blue(`📊 Host: ${serverStatus.host}`));
            console.log(chalk.blue(`🔢 Puerto: ${serverStatus.port}`));
            console.log(chalk.blue(`📅 Versión: ${serverStatus.version}`));

            // Probar operación de escritura
            console.log(chalk.yellow('\n⏳ Probando operación de escritura...'));
            const testCollection = this.db.collection('test_connection');
            await testCollection.insertOne({ test: new Date() });
            await testCollection.deleteMany({});
            
            console.log(chalk.green('✅ Operación de escritura exitosa'));

            // Probar transacciones
            console.log(chalk.yellow('\n⏳ Probando transacciones...'));
            const session = this.db.client.startSession();
            await session.withTransaction(async () => {
                await testCollection.insertOne({ test: 'transaction' }, { session });
            });
            await session.endSession();
            
            console.log(chalk.green('✅ Transacciones funcionando correctamente'));

        } catch (error) {
            console.log(chalk.red(`❌ Error en la conexión: ${error.message}`));
        }
    }

    /**
     * Abrir carpeta de configuración
     */
    async abrirCarpetaConfiguracion() {
        console.log(chalk.cyan('\n📁 ABRIENDO CARPETA DE CONFIGURACIÓN\n'));

        try {
            const configDir = process.cwd();
            const os = require('os');
            
            let comando;
            if (os.platform() === 'win32') {
                comando = `explorer "${configDir}"`;
            } else if (os.platform() === 'darwin') {
                comando = `open "${configDir}"`;
            } else {
                comando = `xdg-open "${configDir}"`;
            }
            
            exec(comando, (error) => {
                if (error) {
                    console.log(chalk.yellow(`⚠️ No se pudo abrir la carpeta automáticamente`));
                    console.log(chalk.gray(`📁 Ubicación: ${configDir}`));
                } else {
                    console.log(chalk.green(`📁 Carpeta abierta: ${configDir}`));
                }
            });
        } catch (error) {
            console.log(chalk.red(`❌ Error al abrir carpeta: ${error.message}`));
        }
    }

    /**
     * Reiniciar sistema
     */
    async reiniciarSistema() {
        console.log(chalk.cyan('\n🔄 REINICIANDO SISTEMA\n'));

        const { confirmar } = await inquirer.prompt([{
            type: 'confirm',
            name: 'confirmar',
            message: '⚠️ ¿Reiniciar el sistema? (Se cerrará la aplicación)',
            default: false
        }]);

        if (confirmar) {
            console.log(chalk.yellow('\n⏳ Reiniciando sistema...'));
            console.log(chalk.green('✅ Sistema reiniciado'));
            process.exit(0);
        }
    }

    /**
     * Ver estado del sistema
     */
    async verEstadoSistema() {
        console.log(chalk.cyan('\n📋 ESTADO DEL SISTEMA\n'));

        try {
            // Información del sistema
            console.log(chalk.blue('🖥️ INFORMACIÓN DEL SISTEMA:'));
            console.log(chalk.gray(`  • Plataforma: ${os.platform()} ${os.arch()}`));
            console.log(chalk.gray(`  • Node.js: ${process.version}`));
            console.log(chalk.gray(`  • Memoria: ${Math.round(os.totalmem() / 1024 / 1024 / 1024)} GB`));
            console.log(chalk.gray(`  • CPU: ${os.cpus().length} núcleos`));

            // Información de la aplicación
            console.log(chalk.blue('\n📱 INFORMACIÓN DE LA APLICACIÓN:'));
            console.log(chalk.gray(`  • Directorio: ${process.cwd()}`));
            console.log(chalk.gray(`  • PID: ${process.pid}`));
            console.log(chalk.gray(`  • Uptime: ${Math.floor(process.uptime())} segundos`));

            // Estado de la base de datos
            console.log(chalk.blue('\n🗄️ ESTADO DE LA BASE DE DATOS:'));
            try {
                const admin = this.db.admin();
                const serverStatus = await admin.serverStatus();
                console.log(chalk.green(`  • Estado: Conectado`));
                console.log(chalk.gray(`  • Host: ${serverStatus.host}`));
                console.log(chalk.gray(`  • Versión: ${serverStatus.version}`));
                console.log(chalk.gray(`  • Uptime: ${Math.floor(serverStatus.uptime / 60)} minutos`));
            } catch (error) {
                console.log(chalk.red(`  • Estado: Desconectado`));
                console.log(chalk.gray(`  • Error: ${error.message}`));
            }

            // Variables de entorno
            console.log(chalk.blue('\n🌐 VARIABLES DE ENTORNO:'));
            console.log(chalk.gray(`  • MONGODB_URI: ${process.env.MONGODB_URI || 'No configurado'}`));
            console.log(chalk.gray(`  • MONGODB_DATABASE: ${process.env.MONGODB_DATABASE || 'No configurado'}`));
            console.log(chalk.gray(`  • NODE_ENV: ${process.env.NODE_ENV || 'No configurado'}`));

        } catch (error) {
            console.log(chalk.red(`❌ Error al obtener estado del sistema: ${error.message}`));
        }
    }

    /**
     * Guardar configuración en archivo .env
     */
    async guardarConfiguracion(config) {
        try {
            let envContent = '';
            
            for (const [key, value] of Object.entries(config)) {
                envContent += `${key}=${value}\n`;
            }
            
            fs.writeFileSync(this.configPath, envContent);
            console.log(chalk.green(`✅ Configuración guardada en ${this.configPath}`));
        } catch (error) {
            console.log(chalk.red(`❌ Error al guardar configuración: ${error.message}`));
        }
    }

    /**
     * Limpiar pantalla
     */
    limpiarPantalla() {
        console.clear();
        console.log(chalk.blue.bold('\n🏋️  GYMMASTER CLI - Sistema de Gestión de Gimnasio'));
        console.log(chalk.gray('================================================\n'));
    }

    /**
     * Pausar y esperar entrada del usuario
     */
    async pausar() {
        console.log(chalk.gray('\n' + '─'.repeat(50)));
        await inquirer.prompt([{
            type: 'input',
            name: 'continuar',
            message: chalk.cyan('Presiona Enter para continuar...')
        }]);
    }
}

module.exports = ConfigCLI;
