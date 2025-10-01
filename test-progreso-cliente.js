/**
 * Pruebas Básicas para el Módulo de Progreso de Clientes
 * 
 * Este archivo contiene pruebas manuales y automatizadas para verificar
 * el funcionamiento correcto del sistema de generación de reportes de progreso.
 */

const { MongoClient } = require('mongodb');
const ClienteProgresoService = require('./services/ClienteProgresoService');
const fs = require('fs').promises;
const path = require('path');

/**
 * Configuración de pruebas
 */
const TEST_CONFIG = {
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/gymmaster',
    testClienteId: null,
    exportsDir: path.join(process.cwd(), 'exports')
};

/**
 * Clase para ejecutar pruebas del módulo de progreso
 */
class ProgresoClienteTester {
    constructor() {
        this.db = null;
        this.client = null;
        this.progresoService = null;
    }

    /**
     * Inicializa la conexión a la base de datos
     */
    async inicializar() {
        try {
            console.log('🔌 Conectando a MongoDB para pruebas...');
            this.client = new MongoClient(TEST_CONFIG.mongoUrl);
            await this.client.connect();
            this.db = this.client.db('gymmaster');
            
            this.progresoService = new ClienteProgresoService(this.db);
            console.log('✅ Conexión establecida correctamente\n');
        } catch (error) {
            console.error('❌ Error al conectar con MongoDB:', error.message);
            throw error;
        }
    }

    /**
     * Cierra la conexión a la base de datos
     */
    async cerrar() {
        if (this.client) {
            await this.client.close();
            console.log('🔌 Conexión cerrada');
        }
    }

    /**
     * Ejecuta todas las pruebas
     */
    async ejecutarTodasLasPruebas() {
        console.log('🧪 INICIANDO PRUEBAS DEL MÓDULO DE PROGRESO DE CLIENTES');
        console.log('=====================================================\n');

        try {
            await this.inicializar();

            // Ejecutar pruebas en orden
            await this.pruebaConexionBaseDatos();
            await this.pruebaBusquedaCliente();
            await this.pruebaGeneracionReporte();
            await this.pruebaEstructuraArchivo();
            await this.pruebaManejoErrores();
            await this.pruebaLimpiezaArchivos();

            console.log('\n✅ TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE');
            console.log('=============================================');

        } catch (error) {
            console.error('\n❌ ERROR EN LAS PRUEBAS:', error.message);
            console.error('=====================================');
        } finally {
            await this.cerrar();
        }
    }

    /**
     * Prueba 1: Conexión a base de datos
     */
    async pruebaConexionBaseDatos() {
        console.log('📋 PRUEBA 1: Conexión a Base de Datos');
        console.log('--------------------------------------');

        try {
            // Verificar que la conexión esté activa
            await this.db.admin().ping();
            console.log('✅ Conexión a MongoDB verificada');

            // Verificar colecciones existentes
            const colecciones = await this.db.listCollections().toArray();
            const nombresColecciones = colecciones.map(c => c.name);
            
            console.log(`✅ Colecciones encontradas: ${nombresColecciones.join(', ')}`);
            
            // Verificar que existan las colecciones necesarias
            const coleccionesRequeridas = ['clientes', 'seguimientos', 'nutricion', 'planesentrenamiento', 'contratos'];
            const coleccionesFaltantes = coleccionesRequeridas.filter(c => !nombresColecciones.includes(c));
            
            if (coleccionesFaltantes.length > 0) {
                console.log(`⚠️ Colecciones faltantes: ${coleccionesFaltantes.join(', ')}`);
            } else {
                console.log('✅ Todas las colecciones requeridas están presentes');
            }

        } catch (error) {
            console.error('❌ Error en prueba de conexión:', error.message);
            throw error;
        }

        console.log('');
    }

    /**
     * Prueba 2: Búsqueda de clientes
     */
    async pruebaBusquedaCliente() {
        console.log('📋 PRUEBA 2: Búsqueda de Clientes');
        console.log('----------------------------------');

        try {
            // Buscar clientes existentes
            const clientes = await this.db.collection('clientes').find({}).limit(5).toArray();
            
            if (clientes.length === 0) {
                console.log('⚠️ No hay clientes en la base de datos');
                console.log('💡 Crear algunos clientes de prueba antes de continuar');
                return;
            }

            console.log(`✅ Se encontraron ${clientes.length} clientes en la base de datos`);
            
            // Probar búsqueda por ID
            const primerCliente = clientes[0];
            const clientePorId = await this.progresoService.buscarCliente(primerCliente._id.toString());
            
            if (clientePorId) {
                console.log('✅ Búsqueda por ID funciona correctamente');
                TEST_CONFIG.testClienteId = primerCliente._id.toString();
            } else {
                console.log('❌ Error en búsqueda por ID');
            }

            // Probar búsqueda por nombre
            const clientePorNombre = await this.progresoService.buscarCliente(primerCliente.nombre);
            
            if (clientePorNombre) {
                console.log('✅ Búsqueda por nombre funciona correctamente');
            } else {
                console.log('❌ Error en búsqueda por nombre');
            }

            // Probar búsqueda por email
            const clientePorEmail = await this.progresoService.buscarCliente(primerCliente.email);
            
            if (clientePorEmail) {
                console.log('✅ Búsqueda por email funciona correctamente');
            } else {
                console.log('❌ Error en búsqueda por email');
            }

        } catch (error) {
            console.error('❌ Error en prueba de búsqueda:', error.message);
            throw error;
        }

        console.log('');
    }

    /**
     * Prueba 3: Generación de reporte
     */
    async pruebaGeneracionReporte() {
        console.log('📋 PRUEBA 3: Generación de Reporte');
        console.log('-----------------------------------');

        if (!TEST_CONFIG.testClienteId) {
            console.log('⚠️ No hay cliente de prueba disponible');
            return;
        }

        try {
            console.log(`🔍 Generando reporte para cliente: ${TEST_CONFIG.testClienteId}`);
            
            const resultado = await this.progresoService.generarProgresoCliente(TEST_CONFIG.testClienteId);
            
            if (resultado.success) {
                console.log('✅ Reporte generado exitosamente');
                console.log(`📄 Archivo: ${resultado.archivo.nombreArchivo}`);
                console.log(`📁 Ubicación: ${resultado.archivo.rutaCompleta}`);
                console.log(`📊 Tamaño: ${resultado.archivo.tamañoBytes} bytes`);
                
                // Verificar que el archivo existe
                try {
                    await fs.access(resultado.archivo.rutaCompleta);
                    console.log('✅ Archivo creado correctamente en el sistema de archivos');
                } catch (error) {
                    console.log('❌ Archivo no encontrado en el sistema de archivos');
                }

                // Mostrar estadísticas
                console.log('📊 Estadísticas del reporte:');
                console.log(`   - Seguimientos: ${resultado.estadisticas.seguimientos}`);
                console.log(`   - Planes nutricionales: ${resultado.estadisticas.planesNutricionales}`);
                console.log(`   - Planes de entrenamiento: ${resultado.estadisticas.planesEntrenamiento}`);
                console.log(`   - Contratos: ${resultado.estadisticas.contratos}`);

            } else {
                console.log('❌ Error al generar reporte:', resultado.mensaje);
            }

        } catch (error) {
            console.error('❌ Error en prueba de generación:', error.message);
            throw error;
        }

        console.log('');
    }

    /**
     * Prueba 4: Estructura del archivo JSON
     */
    async pruebaEstructuraArchivo() {
        console.log('📋 PRUEBA 4: Estructura del Archivo JSON');
        console.log('----------------------------------------');

        try {
            // Buscar archivos de progreso generados
            const archivos = await fs.readdir(TEST_CONFIG.exportsDir);
            const archivosProgreso = archivos.filter(archivo => 
                archivo.endsWith('_progreso.json')
            );

            if (archivosProgreso.length === 0) {
                console.log('⚠️ No hay archivos de progreso para probar');
                return;
            }

            const archivoPrueba = path.join(TEST_CONFIG.exportsDir, archivosProgreso[0]);
            console.log(`🔍 Analizando archivo: ${archivosProgreso[0]}`);

            // Leer y parsear el archivo JSON
            const contenido = await fs.readFile(archivoPrueba, 'utf8');
            const datos = JSON.parse(contenido);

            // Verificar estructura básica
            const estructuraRequerida = [
                'metadatos',
                'cliente',
                'registrosAvance',
                'planesAlimentacion',
                'planesEntrenamiento',
                'contratos',
                'estadisticas'
            ];

            let estructuraValida = true;
            for (const seccion of estructuraRequerida) {
                if (datos[seccion]) {
                    console.log(`✅ Sección '${seccion}' presente`);
                } else {
                    console.log(`❌ Sección '${seccion}' faltante`);
                    estructuraValida = false;
                }
            }

            if (estructuraValida) {
                console.log('✅ Estructura JSON válida');
            } else {
                console.log('❌ Estructura JSON inválida');
            }

            // Verificar metadatos
            if (datos.metadatos) {
                console.log('📋 Metadatos del archivo:');
                console.log(`   - Fecha generación: ${datos.metadatos.fechaGeneracion}`);
                console.log(`   - Versión: ${datos.metadatos.version}`);
                console.log(`   - Tipo: ${datos.metadatos.tipo}`);
            }

            // Verificar datos del cliente
            if (datos.cliente) {
                console.log('👤 Datos del cliente:');
                console.log(`   - Nombre: ${datos.cliente.nombre}`);
                console.log(`   - Email: ${datos.cliente.email}`);
                console.log(`   - Activo: ${datos.cliente.activo}`);
            }

        } catch (error) {
            console.error('❌ Error en prueba de estructura:', error.message);
            throw error;
        }

        console.log('');
    }

    /**
     * Prueba 5: Manejo de errores
     */
    async pruebaManejoErrores() {
        console.log('📋 PRUEBA 5: Manejo de Errores');
        console.log('------------------------------');

        try {
            // Probar con cliente inexistente
            console.log('🔍 Probando con cliente inexistente...');
            try {
                await this.progresoService.generarProgresoCliente('cliente_inexistente_123');
                console.log('❌ Debería haber fallado con cliente inexistente');
            } catch (error) {
                console.log('✅ Error manejado correctamente:', error.message);
            }

            // Probar con ID inválido
            console.log('🔍 Probando con ID inválido...');
            try {
                await this.progresoService.generarProgresoCliente('id_invalido');
                console.log('❌ Debería haber fallado con ID inválido');
            } catch (error) {
                console.log('✅ Error manejado correctamente:', error.message);
            }

            // Probar con entrada vacía
            console.log('🔍 Probando con entrada vacía...');
            try {
                await this.progresoService.generarProgresoCliente('');
                console.log('❌ Debería haber fallado con entrada vacía');
            } catch (error) {
                console.log('✅ Error manejado correctamente:', error.message);
            }

            // Probar con entrada null
            console.log('🔍 Probando con entrada null...');
            try {
                await this.progresoService.generarProgresoCliente(null);
                console.log('❌ Debería haber fallado con entrada null');
            } catch (error) {
                console.log('✅ Error manejado correctamente:', error.message);
            }

        } catch (error) {
            console.error('❌ Error inesperado en prueba de manejo de errores:', error.message);
        }

        console.log('');
    }

    /**
     * Prueba 6: Limpieza de archivos
     */
    async pruebaLimpiezaArchivos() {
        console.log('📋 PRUEBA 6: Limpieza de Archivos');
        console.log('---------------------------------');

        try {
            // Contar archivos antes de limpiar
            const archivosAntes = await fs.readdir(TEST_CONFIG.exportsDir);
            const archivosProgresoAntes = archivosAntes.filter(archivo => 
                archivo.endsWith('_progreso.json')
            );

            console.log(`📊 Archivos de progreso antes de limpiar: ${archivosProgresoAntes.length}`);

            if (archivosProgresoAntes.length > 0) {
                // Limpiar archivos de progreso
                for (const archivo of archivosProgresoAntes) {
                    try {
                        await fs.unlink(path.join(TEST_CONFIG.exportsDir, archivo));
                        console.log(`🗑️ Archivo eliminado: ${archivo}`);
                    } catch (error) {
                        console.log(`❌ Error al eliminar ${archivo}: ${error.message}`);
                    }
                }

                // Verificar limpieza
                const archivosDespues = await fs.readdir(TEST_CONFIG.exportsDir);
                const archivosProgresoDespues = archivosDespues.filter(archivo => 
                    archivo.endsWith('_progreso.json')
                );

                console.log(`📊 Archivos de progreso después de limpiar: ${archivosProgresoDespues.length}`);

                if (archivosProgresoDespues.length === 0) {
                    console.log('✅ Limpieza completada exitosamente');
                } else {
                    console.log('⚠️ Algunos archivos no se pudieron eliminar');
                }
            } else {
                console.log('ℹ️ No hay archivos de progreso para limpiar');
            }

        } catch (error) {
            console.error('❌ Error en prueba de limpieza:', error.message);
        }

        console.log('');
    }
}

/**
 * Función principal para ejecutar las pruebas
 */
async function ejecutarPruebas() {
    const tester = new ProgresoClienteTester();
    await tester.ejecutarTodasLasPruebas();
}

/**
 * Ejecutar pruebas si el archivo se ejecuta directamente
 */
if (require.main === module) {
    ejecutarPruebas().catch(error => {
        console.error('💥 Error fatal en las pruebas:', error);
        process.exit(1);
    });
}

module.exports = ProgresoClienteTester;