/**
 * ===== CLI DE BACKUP Y RESTORE =====
 * 
 * Interfaz de línea de comandos para operaciones de backup y restore
 * Integra con BackupService para operaciones de base de datos
 * 
 * PATRONES DE DISEÑO:
 * - PATRÓN: Command - Encapsula operaciones de backup/restore como comandos
 * - PATRÓN: Facade - Simplifica interfaz compleja de BackupService
 * - PATRÓN: Template Method - Define flujo estándar de operaciones CLI
 * 
 * PRINCIPIOS SOLID:
 * - PRINCIPIO SOLID S: Responsabilidad Única - Solo maneja interfaz CLI
 * - PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevos comandos
 * - PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
 * 
 * BUENAS PRÁCTICAS:
 * - Confirmaciones explícitas para operaciones críticas
 * - Mensajes claros de éxito/error
 * - Validaciones antes de ejecutar operaciones
 * - Manejo robusto de errores
 */

const chalk = require('chalk');
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const BackupService = require('../services/BackupService');

class BackupCLI {
    constructor(database) {
        this.backupService = new BackupService(database);
    }

    /**
     * Muestra el menú principal de backup y restore
     */
    async mostrarMenu() {
        console.log(chalk.blue('\n💾 BACKUP Y RESTORE'));
        console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));

        const opciones = [
            { name: '📦 Crear Backup Completo', value: 'backup_completo' },
            { name: '🎯 Crear Backup Seleccionado', value: 'backup_seleccionado' },
            { name: '📋 Listar Backups Disponibles', value: 'listar_backups' },
            { name: '🔍 Ver Información de Backup', value: 'info_backup' },
            { name: '🔄 Restaurar desde Backup', value: 'restore' },
            { name: '❌ Volver al Menú Principal', value: 'volver' }
        ];

        const respuesta = await inquirer.prompt([
            {
                type: 'list',
                name: 'opcion',
                message: chalk.yellow('¿Qué operación deseas realizar?'),
                choices: opciones
            }
        ]);

        await this.procesarOpcion(respuesta.opcion);
    }

    /**
     * Procesa la opción seleccionada
     * @param {string} opcion - Opción seleccionada
     */
    async procesarOpcion(opcion) {
        switch (opcion) {
            case 'backup_completo':
                await this.crearBackupCompleto();
                break;
            case 'backup_seleccionado':
                await this.crearBackupSeleccionado();
                break;
            case 'listar_backups':
                await this.listarBackups();
                break;
            case 'info_backup':
                await this.mostrarInfoBackup();
                break;
            case 'restore':
                await this.restaurarBackup();
                break;
            case 'volver':
                return;
        }

        // Volver al menú después de cada operación
        await this.mostrarMenu();
    }

    /**
     * Crea un backup completo de todas las colecciones
     */
    async crearBackupCompleto() {
        try {
            console.log(chalk.blue('\n📦 CREAR BACKUP COMPLETO'));
            console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));

            const confirmacion = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'confirmar',
                    message: chalk.yellow('¿Crear backup completo de todas las colecciones?'),
                    default: false
                }
            ]);

            if (!confirmacion.confirmar) {
                console.log(chalk.yellow('❌ Operación cancelada'));
                return;
            }

            const resultado = await this.backupService.backupCompleto();

            if (resultado.success) {
                console.log(chalk.green('\n✅ BACKUP COMPLETO EXITOSO'));
                console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
                console.log(chalk.white(`📁 Archivo: ${resultado.filename}`));
                console.log(chalk.white(`📂 Ubicación: ${resultado.filePath}`));
                console.log(chalk.white(`💾 Tamaño: ${resultado.fileSize} KB`));
                console.log(chalk.white(`📊 Colecciones: ${resultado.collections.length}`));
                console.log(chalk.white(`📄 Total documentos: ${resultado.totalDocuments}`));
            } else {
                console.log(chalk.red('\n❌ ERROR EN BACKUP COMPLETO'));
                console.log(chalk.red(`Error: ${resultado.error}`));
            }

        } catch (error) {
            console.log(chalk.red(`❌ Error inesperado: ${error.message}`));
        }
    }

    /**
     * Crea un backup de colecciones seleccionadas
     */
    async crearBackupSeleccionado() {
        try {
            console.log(chalk.blue('\n🎯 CREAR BACKUP SELECCIONADO'));
            console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));

            const colecciones = [
                { name: '👥 Clientes', value: 'clientes' },
                { name: '📄 Contratos', value: 'contratos' },
                { name: '💰 Finanzas', value: 'finanzas' },
                { name: '🍎 Nutrición', value: 'nutricion' },
                { name: '🏋️ Planes de Entrenamiento', value: 'planesentrenamiento' },
                { name: '📊 Seguimiento', value: 'seguimiento' },
                { name: '💳 Pagos', value: 'pagos' }
            ];

            const respuesta = await inquirer.prompt([
                {
                    type: 'checkbox',
                    name: 'colecciones',
                    message: chalk.yellow('Selecciona las colecciones para el backup:'),
                    choices: colecciones,
                    validate: (input) => {
                        if (input.length === 0) {
                            return 'Debes seleccionar al menos una colección';
                        }
                        return true;
                    }
                }
            ]);

            const confirmacion = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'confirmar',
                    message: chalk.yellow(`¿Crear backup de ${respuesta.colecciones.length} colección(es)?`),
                    default: false
                }
            ]);

            if (!confirmacion.confirmar) {
                console.log(chalk.yellow('❌ Operación cancelada'));
                return;
            }

            const resultado = await this.backupService.backupSeleccionado(respuesta.colecciones);

            if (resultado.success) {
                console.log(chalk.green('\n✅ BACKUP SELECCIONADO EXITOSO'));
                console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
                console.log(chalk.white(`📁 Archivo: ${resultado.filename}`));
                console.log(chalk.white(`📂 Ubicación: ${resultado.filePath}`));
                console.log(chalk.white(`💾 Tamaño: ${resultado.fileSize} KB`));
                console.log(chalk.white(`📊 Colecciones: ${resultado.collections.join(', ')}`));
                console.log(chalk.white(`📄 Total documentos: ${resultado.totalDocuments}`));
            } else {
                console.log(chalk.red('\n❌ ERROR EN BACKUP SELECCIONADO'));
                console.log(chalk.red(`Error: ${resultado.error}`));
            }

        } catch (error) {
            console.log(chalk.red(`❌ Error inesperado: ${error.message}`));
        }
    }

    /**
     * Lista todos los backups disponibles
     */
    async listarBackups() {
        try {
            console.log(chalk.blue('\n📋 BACKUPS DISPONIBLES'));
            console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));

            const backups = this.backupService.listarBackups();

            if (backups.length === 0) {
                console.log(chalk.yellow('📭 No hay backups disponibles'));
                return;
            }

            console.log(chalk.white(`📊 Total de backups: ${backups.length}`));
            console.log('');

            backups.forEach((backup, index) => {
                console.log(chalk.cyan(`${index + 1}. ${backup.filename}`));
                console.log(chalk.gray(`   📂 Ubicación: ${backup.filePath}`));
                console.log(chalk.gray(`   💾 Tamaño: ${backup.size} KB`));
                console.log(chalk.gray(`   📅 Creado: ${backup.created.toLocaleString()}`));
                console.log(chalk.gray(`   🔄 Modificado: ${backup.modified.toLocaleString()}`));
                console.log('');
            });

        } catch (error) {
            console.log(chalk.red(`❌ Error listando backups: ${error.message}`));
        }
    }

    /**
     * Muestra información detallada de un backup
     */
    async mostrarInfoBackup() {
        try {
            console.log(chalk.blue('\n🔍 INFORMACIÓN DE BACKUP'));
            console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));

            const backups = this.backupService.listarBackups();

            if (backups.length === 0) {
                console.log(chalk.yellow('📭 No hay backups disponibles'));
                return;
            }

            const opciones = backups.map(backup => ({
                name: `${backup.filename} (${backup.size} KB)`,
                value: backup.filePath
            }));

            const respuesta = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'backup',
                    message: chalk.yellow('Selecciona el backup para ver información:'),
                    choices: opciones
                }
            ]);

            const info = this.backupService.obtenerInfoBackup(respuesta.backup);

            if (info.error) {
                console.log(chalk.red(`❌ Error: ${info.error}`));
                return;
            }

            console.log(chalk.green('\n📊 INFORMACIÓN DEL BACKUP'));
            console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
            console.log(chalk.white(`📁 Archivo: ${info.archivo}`));
            console.log(chalk.white(`📂 Ubicación: ${info.ruta}`));
            console.log(chalk.white(`💾 Tamaño: ${info.tamaño}`));
            console.log(chalk.white(`📅 Creado: ${info.creado.toLocaleString()}`));
            console.log(chalk.white(`🔄 Modificado: ${info.modificado.toLocaleString()}`));
            console.log(chalk.white(`🏷️ Tipo: ${info.metadata.tipo}`));
            console.log(chalk.white(`📅 Timestamp: ${info.metadata.timestamp}`));
            console.log(chalk.white(`📊 Colecciones: ${info.colecciones.join(', ')}`));
            console.log(chalk.white(`📄 Total documentos: ${info.totalDocumentos}`));
            
            console.log(chalk.blue('\n📋 DETALLES POR COLECCIÓN:'));
            for (const [collectionName, details] of Object.entries(info.detallesColecciones)) {
                console.log(chalk.cyan(`  ${collectionName}:`));
                console.log(chalk.gray(`    📄 Documentos: ${details.documentos}`));
                console.log(chalk.gray(`    🏷️ Campos: ${details.campos.join(', ')}`));
            }

        } catch (error) {
            console.log(chalk.red(`❌ Error mostrando información: ${error.message}`));
        }
    }

    /**
     * Restaura datos desde un backup
     */
    async restaurarBackup() {
        try {
            console.log(chalk.blue('\n🔄 RESTAURAR DESDE BACKUP'));
            console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));

            const backups = this.backupService.listarBackups();

            if (backups.length === 0) {
                console.log(chalk.yellow('📭 No hay backups disponibles'));
                return;
            }

            const opciones = backups.map(backup => ({
                name: `${backup.filename} (${backup.size} KB)`,
                value: backup.filePath
            }));

            const respuesta = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'backup',
                    message: chalk.yellow('Selecciona el backup para restaurar:'),
                    choices: opciones
                }
            ]);

            // Validar esquema del backup
            console.log(chalk.yellow('🔍 Validando esquema del backup...'));
            const validacion = await this.backupService.validarEsquemaBackup(respuesta.backup);

            if (!validacion.success) {
                console.log(chalk.red(`❌ Backup inválido: ${validacion.error}`));
                return;
            }

            console.log(chalk.green('✅ Esquema válido'));

            // Seleccionar modo de restauración
            const modoRespuesta = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'modo',
                    message: chalk.yellow('¿Cómo deseas restaurar los datos?'),
                    choices: [
                        { name: '🔄 Sobrescribir datos existentes (CRÍTICO)', value: 'sobrescribir' },
                        { name: '➕ Restaurar con prefijo (Seguro)', value: 'prefijo' }
                    ]
                }
            ]);

            let prefijo = '';
            if (modoRespuesta.modo === 'prefijo') {
                const prefijoRespuesta = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'prefijo',
                        message: chalk.yellow('Ingresa el prefijo para las colecciones:'),
                        validate: (input) => {
                            if (!input.trim()) {
                                return 'El prefijo no puede estar vacío';
                            }
                            if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(input.trim())) {
                                return 'El prefijo debe comenzar con letra y contener solo letras, números y guiones bajos';
                            }
                            return true;
                        }
                    }
                ]);
                prefijo = prefijoRespuesta.prefijo.trim();
            }

            // Confirmación final
            const mensajeConfirmacion = modoRespuesta.modo === 'sobrescribir' 
                ? chalk.red('⚠️ ATENCIÓN: Esta operación SOBRESCRIBIRÁ los datos existentes. ¿Continuar?')
                : chalk.yellow(`¿Restaurar datos con prefijo "${prefijo}"?`);

            const confirmacion = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'confirmar',
                    message: mensajeConfirmacion,
                    default: false
                }
            ]);

            if (!confirmacion.confirmar) {
                console.log(chalk.yellow('❌ Operación cancelada'));
                return;
            }

            // Ejecutar restauración
            console.log(chalk.yellow('🔄 Ejecutando restauración...'));
            const resultado = await this.backupService.restaurarBackup(
                respuesta.backup, 
                modoRespuesta.modo, 
                prefijo
            );

            if (resultado.success) {
                console.log(chalk.green('\n✅ RESTAURACIÓN EXITOSA'));
                console.log(chalk.gray('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
                console.log(chalk.white(`📊 Total documentos restaurados: ${resultado.resultados.totalRestaurados}`));
                console.log(chalk.white(`🔄 Modo: ${resultado.modo}`));
                if (resultado.prefijo) {
                    console.log(chalk.white(`🏷️ Prefijo: ${resultado.prefijo}`));
                }
                
                console.log(chalk.blue('\n📋 DETALLES POR COLECCIÓN:'));
                for (const [collectionName, details] of Object.entries(resultado.resultados.colecciones)) {
                    console.log(chalk.cyan(`  ${collectionName}:`));
                    console.log(chalk.gray(`    📄 Documentos insertados: ${details.documentosInsertados}`));
                    console.log(chalk.gray(`    📂 Colección destino: ${details.targetCollection}`));
                }

                if (resultado.resultados.errores.length > 0) {
                    console.log(chalk.yellow('\n⚠️ ERRORES PARCIALES:'));
                    resultado.resultados.errores.forEach(error => {
                        console.log(chalk.red(`  ${error.coleccion}: ${error.error}`));
                    });
                }
            } else {
                console.log(chalk.red('\n❌ ERROR EN RESTAURACIÓN'));
                console.log(chalk.red(`Error: ${resultado.error}`));
            }

        } catch (error) {
            console.log(chalk.red(`❌ Error inesperado: ${error.message}`));
        }
    }
}

// ===== EXPORTACIÓN DEL MÓDULO =====
// PATRÓN: Module Pattern - Exporta la clase como módulo
module.exports = BackupCLI;