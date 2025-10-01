const inquirer = require('inquirer');
const chalk = require('chalk');
const dayjs = require('dayjs');
const ClienteProgresoService = require('../services/ClienteProgresoService');

/**
 * CLI para Generación de Reportes de Progreso de Clientes
 * Implementa interfaz interactiva para generar archivos JSON de progreso
 */
class ProgresoCLI {
    constructor(db) {
        this.progresoService = new ClienteProgresoService(db);
    }

    /**
     * Muestra el menú principal de generación de progreso
     */
    async mostrarMenuProgreso() {
        console.log(chalk.blue.bold('\n📊 GENERACIÓN DE REPORTES DE PROGRESO'));
        console.log(chalk.gray('==========================================\n'));

        const opciones = [
            {
                type: 'list',
                name: 'opcion',
                message: chalk.yellow('¿Qué deseas hacer?'),
                choices: [
                    {
                        name: '📄 Generar Reporte de Progreso de Cliente',
                        value: 'generar'
                    },
                    {
                        name: '📋 Ver Archivos de Progreso Generados',
                        value: 'listar'
                    },
                    {
                        name: '🗑️  Limpiar Archivos de Progreso',
                        value: 'limpiar'
                    },
                    {
                        name: '⬅️  Volver al Menú Principal',
                        value: 'volver'
                    }
                ]
            }
        ];

        const respuesta = await inquirer.prompt(opciones);

        switch (respuesta.opcion) {
            case 'generar':
                await this.generarReporteProgreso();
                break;
            case 'listar':
                await this.listarArchivosProgreso();
                break;
            case 'limpiar':
                await this.limpiarArchivosProgreso();
                break;
            case 'volver':
                return;
        }

        // Solo volver al menú de progreso si no se seleccionó "volver"
        if (respuesta.opcion !== 'volver') {
            await this.mostrarMenuProgreso();
        }
    }

    /**
     * Genera un reporte de progreso para un cliente específico
     */
    async generarReporteProgreso() {
        console.log(chalk.blue('\n📄 GENERAR REPORTE DE PROGRESO'));
        console.log(chalk.gray('================================\n'));

        try {
            // Solicitar identificador del cliente
            const datosCliente = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'identificador',
                    message: 'Ingresa el ID o nombre del cliente:',
                    validate: (input) => {
                        if (!input || input.trim().length < 2) {
                            return 'Debe ingresar al menos 2 caracteres';
                        }
                        return true;
                    }
                },
                {
                    type: 'list',
                    name: 'tipoBusqueda',
                    message: 'Tipo de búsqueda:',
                    choices: [
                        { name: 'Por ID del cliente', value: 'id' },
                        { name: 'Por nombre del cliente', value: 'nombre' },
                        { name: 'Por email del cliente', value: 'email' }
                    ],
                    default: 'nombre'
                }
            ]);

            console.log(chalk.yellow('\n⏳ Buscando cliente...'));

            // Generar el reporte de progreso
            const resultado = await this.progresoService.generarProgresoCliente(datosCliente.identificador);

            if (resultado.success) {
                console.log(chalk.green('\n✅ ¡Reporte de progreso generado exitosamente!'));
                console.log(chalk.gray('===============================================\n'));
                
                // Mostrar información del cliente
                console.log(chalk.cyan('👤 CLIENTE:'));
                console.log(chalk.white(`   Nombre: ${resultado.cliente.nombre}`));
                console.log(chalk.white(`   Email: ${resultado.cliente.email}`));
                console.log(chalk.white(`   ID: ${resultado.cliente.id}\n`));

                // Mostrar información del archivo
                console.log(chalk.cyan('📄 ARCHIVO GENERADO:'));
                console.log(chalk.white(`   Nombre: ${resultado.archivo.nombreArchivo}`));
                console.log(chalk.white(`   Ubicación: ${resultado.archivo.rutaCompleta}`));
                console.log(chalk.white(`   Tamaño: ${this.formatearTamaño(resultado.archivo.tamañoBytes)}`));
                console.log(chalk.white(`   Fecha: ${resultado.archivo.fechaCreacion}\n`));

                // Mostrar estadísticas
                console.log(chalk.cyan('📊 ESTADÍSTICAS DEL REPORTE:'));
                console.log(chalk.white(`   Seguimientos físicos: ${resultado.estadisticas.seguimientos}`));
                console.log(chalk.white(`   Planes nutricionales: ${resultado.estadisticas.planesNutricionales}`));
                console.log(chalk.white(`   Planes de entrenamiento: ${resultado.estadisticas.planesEntrenamiento}`));
                console.log(chalk.white(`   Contratos: ${resultado.estadisticas.contratos}\n`));

                // Mostrar contenido del archivo
                const mostrarContenido = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'mostrar',
                        message: '¿Deseas ver el contenido del archivo generado?',
                        default: false
                    }
                ]);

                if (mostrarContenido.mostrar) {
                    await this.mostrarContenidoArchivo(resultado.archivo.rutaCompleta);
                }

                // Opción para abrir el archivo
                const abrirArchivo = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'abrir',
                        message: '¿Deseas abrir el archivo en el explorador?',
                        default: false
                    }
                ]);

                if (abrirArchivo.abrir) {
                    await this.abrirArchivoEnExplorador(resultado.archivo.rutaCompleta);
                }

            } else {
                console.log(chalk.red('\n❌ Error al generar el reporte:'));
                console.log(chalk.red(resultado.mensaje));
            }

        } catch (error) {
            console.log(chalk.red('\n❌ Error al generar reporte de progreso:'));
            console.log(chalk.red(error.message));
        }

        await this.pausar();
    }

    /**
     * Lista los archivos de progreso generados
     */
    async listarArchivosProgreso() {
        console.log(chalk.blue('\n📋 ARCHIVOS DE PROGRESO GENERADOS'));
        console.log(chalk.gray('===================================\n'));

        try {
            const fs = require('fs').promises;
            const path = require('path');

            const exportsDir = path.join(process.cwd(), 'exports');
            
            try {
                await fs.access(exportsDir);
            } catch (error) {
                console.log(chalk.yellow('No existe el directorio exports.'));
                await this.pausar();
                return;
            }

            const archivos = await fs.readdir(exportsDir);
            const archivosProgreso = archivos.filter(archivo => 
                archivo.endsWith('_progreso.json')
            );

            if (archivosProgreso.length === 0) {
                console.log(chalk.yellow('No hay archivos de progreso generados.'));
                await this.pausar();
                return;
            }

            console.log(chalk.green(`Se encontraron ${archivosProgreso.length} archivos de progreso:\n`));

            for (let i = 0; i < archivosProgreso.length; i++) {
                const archivo = archivosProgreso[i];
                const rutaCompleta = path.join(exportsDir, archivo);
                
                try {
                    const stats = await fs.stat(rutaCompleta);
                    const tamaño = this.formatearTamaño(stats.size);
                    const fecha = dayjs(stats.birthtime).format('DD/MM/YYYY HH:mm');

                    console.log(chalk.cyan(`${i + 1}. ${archivo}`));
                    console.log(chalk.gray(`   Tamaño: ${tamaño}`));
                    console.log(chalk.gray(`   Fecha: ${fecha}`));
                    console.log(chalk.gray(`   Ruta: ${rutaCompleta}\n`));
                } catch (error) {
                    console.log(chalk.red(`Error al leer archivo ${archivo}: ${error.message}`));
                }
            }

            // Opción para ver contenido de un archivo
            const verArchivo = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'ver',
                    message: '¿Deseas ver el contenido de algún archivo?',
                    default: false
                }
            ]);

            if (verArchivo.ver) {
                const seleccion = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'archivo',
                        message: 'Selecciona el archivo a ver:',
                        choices: archivosProgreso.map((archivo, index) => ({
                            name: `${index + 1}. ${archivo}`,
                            value: path.join(exportsDir, archivo)
                        }))
                    }
                ]);

                await this.mostrarContenidoArchivo(seleccion.archivo);
            }

        } catch (error) {
            console.log(chalk.red('\n❌ Error al listar archivos:'));
            console.log(chalk.red(error.message));
        }

        await this.pausar();
    }

    /**
     * Limpia los archivos de progreso generados
     */
    async limpiarArchivosProgreso() {
        console.log(chalk.blue('\n🗑️  LIMPIAR ARCHIVOS DE PROGRESO'));
        console.log(chalk.gray('==================================\n'));

        try {
            const fs = require('fs').promises;
            const path = require('path');

            const exportsDir = path.join(process.cwd(), 'exports');
            
            try {
                await fs.access(exportsDir);
            } catch (error) {
                console.log(chalk.yellow('No existe el directorio exports.'));
                await this.pausar();
                return;
            }

            const archivos = await fs.readdir(exportsDir);
            const archivosProgreso = archivos.filter(archivo => 
                archivo.endsWith('_progreso.json')
            );

            if (archivosProgreso.length === 0) {
                console.log(chalk.yellow('No hay archivos de progreso para limpiar.'));
                await this.pausar();
                return;
            }

            console.log(chalk.yellow(`Se encontraron ${archivosProgreso.length} archivos de progreso:`));
            archivosProgreso.forEach((archivo, index) => {
                console.log(chalk.gray(`   ${index + 1}. ${archivo}`));
            });

            const confirmacion = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'confirmar',
                    message: '¿Estás seguro de que deseas eliminar todos estos archivos?',
                    default: false
                }
            ]);

            if (!confirmacion.confirmar) {
                console.log(chalk.yellow('Operación cancelada.'));
                await this.pausar();
                return;
            }

            let eliminados = 0;
            for (const archivo of archivosProgreso) {
                try {
                    await fs.unlink(path.join(exportsDir, archivo));
                    eliminados++;
                } catch (error) {
                    console.log(chalk.red(`Error al eliminar ${archivo}: ${error.message}`));
                }
            }

            console.log(chalk.green(`\n✅ Se eliminaron ${eliminados} archivos de progreso.`));

        } catch (error) {
            console.log(chalk.red('\n❌ Error al limpiar archivos:'));
            console.log(chalk.red(error.message));
        }

        await this.pausar();
    }

    /**
     * Muestra el contenido de un archivo de progreso
     * @param {string} rutaArchivo - Ruta del archivo a mostrar
     */
    async mostrarContenidoArchivo(rutaArchivo) {
        try {
            const fs = require('fs').promises;
            const contenido = await fs.readFile(rutaArchivo, 'utf8');
            
            console.log(chalk.blue('\n📄 CONTENIDO DEL ARCHIVO'));
            console.log(chalk.gray('========================\n'));
            
            // Mostrar solo las primeras líneas para evitar saturar la consola
            const lineas = contenido.split('\n');
            const lineasAMostrar = Math.min(50, lineas.length);
            
            for (let i = 0; i < lineasAMostrar; i++) {
                console.log(chalk.white(lineas[i]));
            }
            
            if (lineas.length > 50) {
                console.log(chalk.yellow(`\n... y ${lineas.length - 50} líneas más`));
            }

            console.log(chalk.green('\n✅ Contenido mostrado'));

        } catch (error) {
            console.log(chalk.red(`❌ Error al leer archivo: ${error.message}`));
        }
    }

    /**
     * Abre un archivo en el explorador del sistema
     * @param {string} rutaArchivo - Ruta del archivo a abrir
     */
    async abrirArchivoEnExplorador(rutaArchivo) {
        try {
            const { exec } = require('child_process');
            const path = require('path');
            
            // Determinar el comando según el sistema operativo
            let comando;
            if (process.platform === 'win32') {
                comando = `explorer "${path.dirname(rutaArchivo)}"`;
            } else if (process.platform === 'darwin') {
                comando = `open "${path.dirname(rutaArchivo)}"`;
            } else {
                comando = `xdg-open "${path.dirname(rutaArchivo)}"`;
            }

            exec(comando, (error) => {
                if (error) {
                    console.log(chalk.yellow('No se pudo abrir el explorador automáticamente.'));
                    console.log(chalk.gray(`Archivo ubicado en: ${rutaArchivo}`));
                } else {
                    console.log(chalk.green('✅ Explorador abierto'));
                }
            });

        } catch (error) {
            console.log(chalk.yellow('No se pudo abrir el explorador automáticamente.'));
            console.log(chalk.gray(`Archivo ubicado en: ${rutaArchivo}`));
        }
    }

    /**
     * Formatea el tamaño de archivo en bytes a formato legible
     * @param {number} bytes - Tamaño en bytes
     * @returns {string} Tamaño formateado
     */
    formatearTamaño(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Pausa la ejecución hasta que el usuario presione Enter
     */
    async pausar() {
        await inquirer.prompt([
            {
                type: 'input',
                name: 'continuar',
                message: 'Presiona Enter para continuar...'
            }
        ]);
    }
}

module.exports = ProgresoCLI;