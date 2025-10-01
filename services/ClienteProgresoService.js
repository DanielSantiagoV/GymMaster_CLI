// ===== IMPORTS Y DEPENDENCIAS =====
// Importación de utilidades y modelos de dominio
// PATRÓN: Dependency Injection - Se inyectan las dependencias a través del constructor
// PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (repositorios) no de implementaciones concretas
const { ObjectId } = require('mongodb'); // Utilidad para manejo de IDs de MongoDB
const dayjs = require('dayjs'); // Utilidad para manejo de fechas
const ClienteService = require('./ClienteService'); // Servicio para operaciones de clientes
const SeguimientoService = require('./SeguimientoService'); // Servicio para operaciones de seguimientos
const NutricionService = require('./NutricionService'); // Servicio para operaciones de nutrición
const PlanEntrenamientoService = require('./PlanEntrenamientoService'); // Servicio para operaciones de planes de entrenamiento
const ContratoService = require('./ContratoService'); // Servicio para operaciones de contratos

/**
 * Servicio para generar reportes de progreso de clientes
 * Implementa lógica de negocio para exportar datos completos de clientes
 * Maneja la recopilación de datos de múltiples fuentes y la generación de JSON estructurado
 * 
 * PATRÓN: Service Layer - Capa de servicio que orquesta la lógica de negocio de exportación
 * PATRÓN: Facade - Proporciona una interfaz simplificada para operaciones complejas de exportación
 * PATRÓN: Data Transfer Object (DTO) - Proporciona datos estructurados para exportación
 * PRINCIPIO SOLID S: Responsabilidad Única - Se encarga únicamente de la exportación de progreso de clientes
 * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (servicios) no de implementaciones concretas
 */
class ClienteProgresoService {
    /**
     * Constructor del servicio de progreso de clientes
     * @param {Object} db - Instancia de la base de datos (MongoDB)
     * 
     * PATRÓN: Dependency Injection - Recibe las dependencias como parámetros
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones, no de implementaciones concretas
     * BUENA PRÁCTICA: Inicialización de servicios en el constructor para reutilización
     */
    constructor(db) {
        // Almacena la conexión a la base de datos para uso interno
        this.db = db;
        // PATRÓN: Service Layer - Servicios para operaciones específicas
        // PRINCIPIO SOLID D: Depende de abstracciones de servicios
        this.clienteService = new ClienteService(db);
        this.seguimientoService = new SeguimientoService(db);
        this.nutricionService = new NutricionService(db);
        this.planEntrenamientoService = new PlanEntrenamientoService(db);
        this.contratoService = new ContratoService(db);
    }

    /**
     * Genera un archivo JSON con el progreso completo de un cliente
     * @param {string} clienteIdentificador - ID o nombre del cliente
     * @returns {Promise<Object>} Resultado de la operación con información del archivo generado
     * 
     * PATRÓN: Template Method - Define el flujo estándar de generación de progreso
     * PATRÓN: Data Transfer Object (DTO) - Retorna objeto estructurado
     * PATRÓN: Guard Clause - Validaciones tempranas
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de generar progreso de clientes
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas fuentes de datos
     */
    async generarProgresoCliente(clienteIdentificador) {
        try {
            // ===== VALIDACIÓN DE ENTRADA =====
            // PATRÓN: Guard Clause - Validación temprana de entrada
            // PRINCIPIO SOLID S: Responsabilidad de validación de entrada
            if (!clienteIdentificador || typeof clienteIdentificador !== 'string') {
                throw new Error('Identificador del cliente es requerido');
            }

            // ===== BÚSQUEDA DEL CLIENTE =====
            // PATRÓN: Strategy - Diferentes estrategias según el tipo de identificador
            // PRINCIPIO SOLID S: Delegación de responsabilidad de búsqueda
            const cliente = await this.buscarCliente(clienteIdentificador);
            
            // PATRÓN: Guard Clause - Validación de existencia del cliente
            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }

            // ===== RECOPILACIÓN DE DATOS =====
            // PATRÓN: Parallel Processing - Optimización con Promise.all
            // BUENA PRÁCTICA: Recopilar datos de múltiples fuentes en paralelo
            console.log('📊 Recopilando datos del cliente...');
            
            const [
                datosBasicos,
                seguimientos,
                planesNutricionales,
                planesEntrenamiento,
                contratos
            ] = await Promise.all([
                this.obtenerDatosBasicosCliente(cliente.clienteId),
                this.obtenerSeguimientosCliente(cliente.clienteId),
                this.obtenerPlanesNutricionalesCliente(cliente.clienteId),
                this.obtenerPlanesEntrenamientoCliente(cliente.clienteId),
                this.obtenerContratosCliente(cliente.clienteId)
            ]);

            // ===== CONSTRUCCIÓN DEL OBJETO DE PROGRESO =====
            // PATRÓN: Builder - Construcción paso a paso del objeto de progreso
            // PATRÓN: Data Transfer Object (DTO) - Objeto estructurado para exportación
            const progresoCliente = this.construirObjetoProgreso({
                datosBasicos,
                seguimientos,
                planesNutricionales,
                planesEntrenamiento,
                contratos
            });

            // ===== GENERACIÓN DEL ARCHIVO =====
            // PATRÓN: Strategy - Delegación de generación de archivo
            // PRINCIPIO SOLID S: Delegación de responsabilidad de generación de archivo
            const archivoGenerado = await this.generarArchivoProgreso(cliente, progresoCliente);

            // ===== CONSTRUCCIÓN DE RESPUESTA =====
            // PATRÓN: Data Transfer Object (DTO) - Objeto estructurado para transferencia
            return {
                success: true,
                mensaje: 'Archivo de progreso generado exitosamente',
                archivo: archivoGenerado,
                cliente: {
                    id: cliente.clienteId,
                    nombre: cliente.nombreCompleto,
                    email: cliente.email
                },
                estadisticas: {
                    seguimientos: seguimientos.length,
                    planesNutricionales: planesNutricionales.length,
                    planesEntrenamiento: planesEntrenamiento.length,
                    contratos: contratos.length
                }
            };

        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Wrapping - Envuelve errores con contexto específico
            // PRINCIPIO SOLID S: Responsabilidad de manejo de errores del método
            throw new Error(`Error al generar progreso del cliente: ${error.message}`);
        }
    }

    /**
     * Busca un cliente por ID o nombre
     * @param {string} identificador - ID o nombre del cliente
     * @returns {Promise<Object|null>} Cliente encontrado o null
     * 
     * PATRÓN: Strategy - Diferentes estrategias según el tipo de identificador
     * PRINCIPIO SOLID S: Responsabilidad de búsqueda de clientes
     */
    async buscarCliente(identificador) {
        try {
            // Si es un ObjectId válido, buscar por ID
            if (ObjectId.isValid(identificador)) {
                const cliente = await this.clienteService.getClienteById(identificador);
                return cliente;
            }

            // Si no es ObjectId, buscar por nombre o email
            const resultado = await this.clienteService.buscarClientes(identificador);
            
            if (resultado.success && resultado.data.length > 0) {
                // Si hay múltiples resultados, tomar el primero
                // En una implementación más avanzada, se podría mostrar opciones
                return resultado.data[0];
            }

            return null;
        } catch (error) {
            throw new Error(`Error al buscar cliente: ${error.message}`);
        }
    }

    /**
     * Obtiene los datos básicos del cliente
     * @param {string} clienteId - ID del cliente
     * @returns {Promise<Object>} Datos básicos del cliente
     */
    async obtenerDatosBasicosCliente(clienteId) {
        try {
            const cliente = await this.clienteService.getClienteById(clienteId);
            
            return {
                clienteId: cliente.clienteId,
                nombre: cliente.nombreCompleto,
                email: cliente.email,
                telefono: cliente.telefono,
                fechaRegistro: cliente.fechaRegistro,
                activo: cliente.activo,
                nivel: cliente.nivel || 'No especificado'
            };
        } catch (error) {
            throw new Error(`Error al obtener datos básicos: ${error.message}`);
        }
    }

    /**
     * Obtiene todos los seguimientos del cliente
     * @param {string} clienteId - ID del cliente
     * @returns {Promise<Array>} Array de seguimientos
     */
    async obtenerSeguimientosCliente(clienteId) {
        try {
            const resultado = await this.seguimientoService.obtenerSeguimientosPorCliente(clienteId);
            
            if (resultado.success) {
                return resultado.data.map(seguimiento => ({
                    seguimientoId: seguimiento.seguimientoId,
                    fecha: dayjs(seguimiento.fecha).format('YYYY-MM-DD'),
                    peso: seguimiento.peso,
                    grasaCorporal: seguimiento.grasaCorporal,
                    medidas: seguimiento.medidas || {},
                    fotos: seguimiento.fotos || [],
                    comentarios: seguimiento.comentarios || '',
                    contratoId: seguimiento.contratoId
                }));
            }

            return [];
        } catch (error) {
            throw new Error(`Error al obtener seguimientos: ${error.message}`);
        }
    }

    /**
     * Obtiene todos los planes nutricionales del cliente
     * @param {string} clienteId - ID del cliente
     * @returns {Promise<Array>} Array de planes nutricionales
     */
    async obtenerPlanesNutricionalesCliente(clienteId) {
        try {
            const resultado = await this.nutricionService.obtenerPlanesPorCliente(clienteId);
            
            if (resultado.success) {
                return resultado.data.map(plan => ({
                    nutricionId: plan.nutricionId,
                    tipoPlan: plan.tipoPlan,
                    detallePlan: plan.detallePlan,
                    evaluacionNutricional: plan.evaluacionNutricional,
                    estado: plan.estado,
                    fechaCreacion: plan.fechaCreacion,
                    fechaActualizacion: plan.fechaActualizacion,
                    notasAdicionales: plan.notasAdicionales,
                    contratoId: plan.contratoId
                }));
            }

            return [];
        } catch (error) {
            throw new Error(`Error al obtener planes nutricionales: ${error.message}`);
        }
    }

    /**
     * Obtiene todos los planes de entrenamiento del cliente
     * @param {string} clienteId - ID del cliente
     * @returns {Promise<Array>} Array de planes de entrenamiento
     */
    async obtenerPlanesEntrenamientoCliente(clienteId) {
        try {
            // Obtener planes asignados al cliente
            const cliente = await this.clienteService.getClienteById(clienteId);
            
            if (!cliente || !cliente.planes || cliente.planes.length === 0) {
                return [];
            }

            const planes = [];
            for (const planId of cliente.planes) {
                try {
                    const plan = await this.planEntrenamientoService.obtenerPlanPorId(planId.toString());
                    if (plan && plan.success) {
                        planes.push({
                            planId: plan.data.planId,
                            nombre: plan.data.nombre,
                            duracionSemanas: plan.data.duracionSemanas,
                            metasFisicas: plan.data.metasFisicas,
                            nivel: plan.data.nivel,
                            estado: plan.data.estado,
                            fechaCreacion: plan.data.fechaCreacion
                        });
                    }
                } catch (error) {
                    console.log(`⚠️ Error al obtener plan ${planId}: ${error.message}`);
                }
            }

            return planes;
        } catch (error) {
            throw new Error(`Error al obtener planes de entrenamiento: ${error.message}`);
        }
    }

    /**
     * Obtiene todos los contratos del cliente
     * @param {string} clienteId - ID del cliente
     * @returns {Promise<Array>} Array de contratos
     */
    async obtenerContratosCliente(clienteId) {
        try {
            const resultado = await this.contratoService.obtenerContratosPorCliente(clienteId);
            
            if (resultado.success) {
                return resultado.data.map(contrato => ({
                    contratoId: contrato.contratoId,
                    planId: contrato.planId,
                    estado: contrato.estado,
                    fechaInicio: dayjs(contrato.fechaInicio).format('YYYY-MM-DD'),
                    fechaFin: dayjs(contrato.fechaFin).format('YYYY-MM-DD'),
                    precio: contrato.precio,
                    duracionMeses: contrato.duracionMeses,
                    condiciones: contrato.condiciones || '',
                    fechaCreacion: dayjs(contrato.fechaCreacion).format('YYYY-MM-DD')
                }));
            }

            return [];
        } catch (error) {
            throw new Error(`Error al obtener contratos: ${error.message}`);
        }
    }

    /**
     * Construye el objeto de progreso con todos los datos recopilados
     * @param {Object} datos - Datos recopilados del cliente
     * @returns {Object} Objeto de progreso estructurado
     * 
     * PATRÓN: Builder - Construcción paso a paso del objeto de progreso
     * PATRÓN: Data Transfer Object (DTO) - Objeto estructurado para exportación
     */
    construirObjetoProgreso(datos) {
        const { datosBasicos, seguimientos, planesNutricionales, planesEntrenamiento, contratos } = datos;

        return {
            // Metadatos del reporte
            metadatos: {
                fechaGeneracion: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                version: '1.0',
                tipo: 'reporte_progreso_cliente'
            },
            
            // Datos básicos del cliente
            cliente: {
                ...datosBasicos,
                fechaRegistro: dayjs(datosBasicos.fechaRegistro).format('YYYY-MM-DD')
            },
            
            // Registros de avance físico y nutricional
            registrosAvance: {
                seguimientos: seguimientos,
                resumen: {
                    totalSeguimientos: seguimientos.length,
                    ultimoSeguimiento: seguimientos.length > 0 ? seguimientos[0].fecha : null,
                    tienePeso: seguimientos.some(s => s.peso !== null && s.peso !== undefined),
                    tieneGrasaCorporal: seguimientos.some(s => s.grasaCorporal !== null && s.grasaCorporal !== undefined),
                    tieneMedidas: seguimientos.some(s => Object.keys(s.medidas).length > 0),
                    tieneFotos: seguimientos.some(s => s.fotos.length > 0)
                }
            },
            
            // Planes de alimentación asociados
            planesAlimentacion: {
                planesNutricionales: planesNutricionales,
                planActivo: planesNutricionales.find(p => p.estado === 'activo') || null,
                resumen: {
                    totalPlanes: planesNutricionales.length,
                    planesActivos: planesNutricionales.filter(p => p.estado === 'activo').length,
                    planesFinalizados: planesNutricionales.filter(p => p.estado === 'finalizado').length,
                    planesCancelados: planesNutricionales.filter(p => p.estado === 'cancelado').length
                }
            },
            
            // Referencias a planes de entrenamiento activos y pasados
            planesEntrenamiento: {
                planes: planesEntrenamiento,
                resumen: {
                    totalPlanes: planesEntrenamiento.length,
                    planesActivos: planesEntrenamiento.filter(p => p.estado === 'activo').length,
                    planesFinalizados: planesEntrenamiento.filter(p => p.estado === 'finalizado').length,
                    planesCancelados: planesEntrenamiento.filter(p => p.estado === 'cancelado').length
                }
            },
            
            // Contratos asociados
            contratos: {
                contratos: contratos,
                resumen: {
                    totalContratos: contratos.length,
                    contratosVigentes: contratos.filter(c => c.estado === 'vigente').length,
                    contratosVencidos: contratos.filter(c => c.estado === 'vencido').length,
                    contratosCancelados: contratos.filter(c => c.estado === 'cancelado').length
                }
            },
            
            // Estadísticas generales
            estadisticas: {
                fechaGeneracion: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                totalRegistros: seguimientos.length + planesNutricionales.length + planesEntrenamiento.length + contratos.length,
                periodoAnalisis: {
                    fechaInicio: seguimientos.length > 0 ? seguimientos[seguimientos.length - 1].fecha : null,
                    fechaFin: seguimientos.length > 0 ? seguimientos[0].fecha : null
                }
            }
        };
    }

    /**
     * Genera el archivo JSON de progreso del cliente
     * @param {Object} cliente - Datos del cliente
     * @param {Object} progresoCliente - Objeto de progreso estructurado
     * @returns {Promise<Object>} Información del archivo generado
     * 
     * PATRÓN: Strategy - Delegación de generación de archivo
     * PRINCIPIO SOLID S: Responsabilidad de generación de archivo
     */
    async generarArchivoProgreso(cliente, progresoCliente) {
        try {
            const fs = require('fs').promises;
            const path = require('path');

            // Crear directorio exports si no existe
            const exportsDir = path.join(process.cwd(), 'exports');
            try {
                await fs.access(exportsDir);
            } catch (error) {
                await fs.mkdir(exportsDir, { recursive: true });
                console.log('📁 Directorio exports creado');
            }

            // Generar nombre del archivo
            const nombreArchivo = `cliente_${cliente.nombreCompleto.replace(/\s+/g, '_').toLowerCase()}_progreso.json`;
            const rutaArchivo = path.join(exportsDir, nombreArchivo);

            // Convertir objeto a JSON con formato legible
            const jsonContent = JSON.stringify(progresoCliente, null, 2);

            // Escribir archivo
            await fs.writeFile(rutaArchivo, jsonContent, 'utf8');

            // Obtener información del archivo
            const stats = await fs.stat(rutaArchivo);

            return {
                nombreArchivo: nombreArchivo,
                rutaCompleta: rutaArchivo,
                tamañoBytes: stats.size,
                fechaCreacion: dayjs(stats.birthtime).format('YYYY-MM-DD HH:mm:ss')
            };

        } catch (error) {
            throw new Error(`Error al generar archivo: ${error.message}`);
        }
    }
}

// ===== EXPORTACIÓN DEL MÓDULO =====
// PATRÓN: Module Pattern - Exporta la clase como módulo
// PRINCIPIO SOLID S: Responsabilidad de proporcionar la interfaz pública del servicio
module.exports = ClienteProgresoService;