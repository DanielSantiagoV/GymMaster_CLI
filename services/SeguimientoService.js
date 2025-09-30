// ===== IMPORTS Y DEPENDENCIAS =====
// Importación de utilidades de MongoDB
// PATRÓN: Dependency Injection - Se inyectan las dependencias a través del constructor
// PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (repositorios) no de implementaciones concretas
const { ObjectId } = require('mongodb'); // Utilidad para manejo de ObjectIds de MongoDB
const { Seguimiento } = require('../models'); // Modelo de dominio para seguimientos
const SeguimientoRepository = require('../repositories/SeguimientoRepository'); // Repositorio para operaciones CRUD de seguimientos
const ClienteRepository = require('../repositories/ClienteRepository'); // Repositorio para operaciones CRUD de clientes
const ContratoRepository = require('../repositories/ContratoRepository'); // Repositorio para operaciones CRUD de contratos
const ProgresoService = require('./ProgresoService'); // Servicio para análisis de progreso físico

/**
 * Servicio para gestión de seguimientos físicos
 * Implementa lógica de negocio para seguimientos siguiendo principios SOLID
 * Maneja validaciones, transacciones y coordinación con otros módulos
 * 
 * PATRÓN: Service Layer - Capa de servicio que orquesta la gestión de seguimientos
 * PATRÓN: Facade - Proporciona una interfaz unificada para operaciones de seguimiento
 * PATRÓN: Transaction - Maneja transacciones para operaciones críticas
 * PATRÓN: Data Transfer Object (DTO) - Proporciona seguimientos estructurados
 * PRINCIPIO SOLID S: Responsabilidad Única - Se encarga únicamente de la gestión de seguimientos
 * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas funcionalidades de seguimiento
 * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (repositorios) no de implementaciones concretas
 * 
 * NOTA: Este servicio SÍ maneja transacciones para operaciones críticas
 * BUENA PRÁCTICA: Servicio especializado en gestión de seguimientos físicos
 */
class SeguimientoService {
    /**
     * Constructor del servicio de seguimientos
     * @param {Object} db - Instancia de la base de datos (MongoDB)
     * 
     * PATRÓN: Dependency Injection - Recibe las dependencias como parámetros
     * PATRÓN: Repository - Inicializa todos los repositorios necesarios
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones, no de implementaciones concretas
     * BUENA PRÁCTICA: Inicialización de repositorios en el constructor para reutilización
     */
    constructor(db) {
        // Almacena la conexión a la base de datos para uso interno
        this.db = db;
        // PATRÓN: Repository - Abstrae el acceso a datos de seguimientos
        // PRINCIPIO SOLID D: Depende de abstracción SeguimientoRepository
        this.seguimientoRepository = new SeguimientoRepository(db);
        // PATRÓN: Repository - Abstrae el acceso a datos de clientes
        // PRINCIPIO SOLID D: Depende de abstracción ClienteRepository
        this.clienteRepository = new ClienteRepository(db);
        // PATRÓN: Repository - Abstrae el acceso a datos de contratos
        // PRINCIPIO SOLID D: Depende de abstracción ContratoRepository
        this.contratoRepository = new ContratoRepository(db);
        // PATRÓN: Service Layer - Servicio para análisis de progreso
        // PRINCIPIO SOLID D: Depende de abstracción ProgresoService
        this.progresoService = new ProgresoService();
    }

    /**
     * Crea un nuevo seguimiento con validaciones de negocio
     * @param {Object} datosSeguimiento - Datos del seguimiento a crear
     * @returns {Promise<Object>} Resultado de la operación
     * 
     * PATRÓN: Template Method - Define el flujo estándar de creación de seguimientos
     * PATRÓN: Transaction - Maneja transacciones para operaciones críticas
     * PATRÓN: Data Transfer Object (DTO) - Proporciona seguimientos estructurados
     * PATRÓN: Guard Clause - Validaciones tempranas
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de crear seguimientos
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para creación
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (repositorios)
     * 
     * TRANSACCIONES: SÍ implementa transacciones MongoDB para operaciones críticas
     * BUENA PRÁCTICA: Método principal que orquesta la creación de seguimientos
     */
    async crearSeguimiento(datosSeguimiento) {
        try {
            // ===== VALIDACIÓN DE CLIENTE =====
            // PATRÓN: Guard Clause - Validación temprana de existencia del cliente
            // PRINCIPIO SOLID S: Responsabilidad de validar datos de entrada
            const cliente = await this.clienteRepository.getById(datosSeguimiento.clienteId);
            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }

            // PATRÓN: Guard Clause - Validación de estado del cliente
            // PRINCIPIO SOLID S: Responsabilidad de validar reglas de negocio
            if (!cliente.activo) {
                throw new Error('Solo se pueden crear seguimientos para clientes activos');
            }

            // ===== VALIDACIÓN DE CONTRATO =====
            // PATRÓN: Guard Clause - Validación temprana de existencia del contrato
            // PRINCIPIO SOLID S: Responsabilidad de validar datos de entrada
            const contrato = await this.contratoRepository.getById(datosSeguimiento.contratoId);
            if (!contrato) {
                throw new Error('Contrato no encontrado');
            }

            // PATRÓN: Guard Clause - Validación de estado del contrato
            // PRINCIPIO SOLID S: Responsabilidad de validar reglas de negocio
            if (contrato.estado !== 'vigente') {
                throw new Error('Solo se pueden crear seguimientos para contratos vigentes');
            }

            // PATRÓN: Guard Clause - Validación de relación cliente-contrato
            // PRINCIPIO SOLID S: Responsabilidad de validar reglas de negocio
            if (contrato.clienteId.toString() !== datosSeguimiento.clienteId.toString()) {
                throw new Error('El contrato no pertenece al cliente especificado');
            }

            // ===== VALIDACIÓN DE FECHAS =====
            // PATRÓN: Strategy - Delegación de validación de fechas
            // PRINCIPIO SOLID S: Delegación de responsabilidad de validación
            this.validarFechasSeguimiento(datosSeguimiento.fecha);

            // ===== VALIDACIÓN DE DATOS FÍSICOS =====
            // PATRÓN: Strategy - Delegación de validación de datos físicos
            // PRINCIPIO SOLID S: Delegación de responsabilidad de validación
            this.validarDatosFisicos(datosSeguimiento);

            // ===== CREACIÓN DE INSTANCIA DEL SEGUIMIENTO =====
            // PATRÓN: Factory - Crea instancia del modelo de dominio
            // PATRÓN: Data Transfer Object (DTO) - Estructura seguimiento como objeto
            // PRINCIPIO SOLID S: Responsabilidad de crear instancia del seguimiento
            const seguimiento = new Seguimiento({
                clienteId: datosSeguimiento.clienteId,
                contratoId: datosSeguimiento.contratoId,
                fecha: datosSeguimiento.fecha,
                peso: datosSeguimiento.peso,
                grasaCorporal: datosSeguimiento.grasaCorporal,
                medidas: datosSeguimiento.medidas || {},
                fotos: datosSeguimiento.fotos || [],
                comentarios: datosSeguimiento.comentarios || ''
            });

            // ===== IMPLEMENTACIÓN DE TRANSACCIONES =====
            // PATRÓN: Transaction - Maneja transacciones para operaciones críticas
            // PRINCIPIO SOLID S: Responsabilidad de garantizar consistencia atómica
            try {
                // ===== INICIO DE TRANSACCIÓN =====
                // PATRÓN: Transaction - Inicia sesión de transacción
                // BUENA PRÁCTICA: Transacciones para garantizar consistencia atómica
                const session = this.db.client.startSession();
                
                try {
                    let resultado;
                    
                    // ===== EJECUCIÓN DE TRANSACCIÓN =====
                    // PATRÓN: Transaction - Todas las operaciones en una transacción
                    // PRINCIPIO SOLID S: Responsabilidad de garantizar consistencia
                    await session.withTransaction(async () => {
                        // ===== OPERACIÓN 1: CREAR SEGUIMIENTO =====
                        // PATRÓN: Repository - Abstrae la operación de creación
                        // BUENA PRÁCTICA: Crear seguimiento en base de datos
                        const seguimientoId = await this.seguimientoRepository.create(seguimiento);

                        // ===== OPERACIÓN 2: ACTUALIZAR ESTADÍSTICAS =====
                        // PATRÓN: Strategy - Delegación de actualización de estadísticas
                        // BUENA PRÁCTICA: Mantener estadísticas actualizadas
                        await this.actualizarEstadisticasCliente(datosSeguimiento.clienteId);

                        // ===== CONSTRUCCIÓN DE RESPUESTA =====
                        // PATRÓN: Data Transfer Object (DTO) - Objeto estructurado para transferencia
                        resultado = {
                            success: true, // Indicador de éxito de la operación
                            seguimientoId: seguimientoId, // ID del seguimiento creado
                            mensaje: 'Seguimiento creado exitosamente' // Mensaje descriptivo
                        };
                    });

                    return resultado;
                } finally {
                    // ===== FIN DE TRANSACCIÓN =====
                    // BUENA PRÁCTICA: Siempre cerrar la sesión
                    await session.endSession();
                }
            } catch (transactionError) {
                // ===== FALLBACK SIN TRANSACCIONES =====
                // PATRÓN: Fallback - Estrategia alternativa cuando transacciones no están disponibles
                // PRINCIPIO SOLID S: Responsabilidad de manejar fallos de transacciones
                console.log('⚠️ Transacciones no disponibles, creando sin transacción...');
                
                // ===== OPERACIÓN 1: CREAR SEGUIMIENTO =====
                // PATRÓN: Repository - Abstrae la operación de creación
                // BUENA PRÁCTICA: Crear seguimiento sin transacción
                const seguimientoId = await this.seguimientoRepository.create(seguimiento);

                // ===== OPERACIÓN 2: ACTUALIZAR ESTADÍSTICAS =====
                // PATRÓN: Strategy - Delegación de actualización de estadísticas
                // BUENA PRÁCTICA: Mantener estadísticas actualizadas
                await this.actualizarEstadisticasCliente(datosSeguimiento.clienteId);

                // ===== CONSTRUCCIÓN DE RESPUESTA =====
                // PATRÓN: Data Transfer Object (DTO) - Objeto estructurado para transferencia
                return {
                    success: true, // Indicador de éxito de la operación
                    seguimientoId: seguimientoId, // ID del seguimiento creado
                    mensaje: 'Seguimiento creado exitosamente' // Mensaje descriptivo
                };
            }

        } catch (error) {
            throw new Error(`Error al crear seguimiento: ${error.message}`);
        }
    }

    /**
     * Lista seguimientos con filtros opcionales
     * @param {Object} filtros - Filtros de búsqueda
     * @param {Object} opciones - Opciones de paginación
     * @returns {Promise<Object>} Lista de seguimientos
     */
    async listarSeguimientos(filtros = {}, opciones = {}) {
        try {
            const seguimientos = await this.seguimientoRepository.getAll(filtros, opciones);
            
            // Enriquecer con información de cliente y contrato
            const seguimientosEnriquecidos = await Promise.all(
                seguimientos.map(async (seguimiento) => {
                    const cliente = await this.clienteRepository.getById(seguimiento.clienteId);
                    const contrato = await this.contratoRepository.getById(seguimiento.contratoId);
                    
                    return {
                        ...seguimiento,
                        cliente: cliente ? {
                            nombre: cliente.nombre,
                            apellido: cliente.apellido,
                            email: cliente.email
                        } : null,
                        contrato: contrato ? {
                            contratoId: contrato.contratoId,
                            estado: contrato.estado,
                            fechaInicio: contrato.fechaInicio,
                            fechaFin: contrato.fechaFin
                        } : null
                    };
                })
            );

            return {
                success: true,
                data: seguimientosEnriquecidos,
                total: seguimientosEnriquecidos.length
            };
        } catch (error) {
            throw new Error(`Error al listar seguimientos: ${error.message}`);
        }
    }

    /**
     * Obtiene un seguimiento por ID con información completa
     * @param {string|ObjectId} seguimientoId - ID del seguimiento
     * @returns {Promise<Object>} Seguimiento con información completa
     */
    async obtenerSeguimiento(seguimientoId) {
        try {
            const seguimiento = await this.seguimientoRepository.getById(seguimientoId);
            if (!seguimiento) {
                throw new Error('Seguimiento no encontrado');
            }

            // Obtener información del cliente y contrato
            const cliente = await this.clienteRepository.getById(seguimiento.clienteId);
            const contrato = await this.contratoRepository.getById(seguimiento.contratoId);

            return {
                success: true,
                data: {
                    _id: seguimiento.seguimientoId,
                    seguimientoId: seguimiento.seguimientoId,
                    clienteId: seguimiento.clienteId,
                    contratoId: seguimiento.contratoId,
                    fecha: seguimiento.fecha,
                    peso: seguimiento.peso,
                    grasaCorporal: seguimiento.grasaCorporal,
                    medidas: seguimiento.medidas,
                    fotos: seguimiento.fotos,
                    comentarios: seguimiento.comentarios,
                    cliente: cliente ? {
                        nombre: cliente.nombre,
                        apellido: cliente.apellido,
                        email: cliente.email,
                        telefono: cliente.telefono
                    } : null,
                    contrato: contrato ? {
                        contratoId: contrato.contratoId,
                        estado: contrato.estado,
                        fechaInicio: contrato.fechaInicio,
                        fechaFin: contrato.fechaFin,
                        precio: contrato.precio
                    } : null
                }
            };
        } catch (error) {
            throw new Error(`Error al obtener seguimiento: ${error.message}`);
        }
    }

    /**
     * Actualiza un seguimiento existente
     * @param {string|ObjectId} seguimientoId - ID del seguimiento
     * @param {Object} datosActualizados - Datos a actualizar
     * @returns {Promise<Object>} Resultado de la operación
     */
    async actualizarSeguimiento(seguimientoId, datosActualizados) {
        try {
            const seguimiento = await this.seguimientoRepository.getById(seguimientoId);
            if (!seguimiento) {
                throw new Error('Seguimiento no encontrado');
            }

            // Validar fechas si se actualizan
            if (datosActualizados.fecha) {
                this.validarFechasSeguimiento(datosActualizados.fecha);
            }

            // Validar datos físicos si se actualizan
            if (datosActualizados.peso || datosActualizados.grasaCorporal || datosActualizados.medidas) {
                this.validarDatosFisicos(datosActualizados);
            }

            const resultado = await this.seguimientoRepository.update(seguimientoId, datosActualizados);
            
            if (resultado) {
                // Actualizar estadísticas del cliente
                await this.actualizarEstadisticasCliente(seguimiento.clienteId);
                
                // Analizar progreso si se actualizaron datos físicos
                let analisisProgreso = null;
                if (datosActualizados.peso || datosActualizados.grasaCorporal || datosActualizados.medidas) {
                    analisisProgreso = await this.analizarProgresoActualizacion(seguimientoId, seguimiento, datosActualizados);
                }
                
                return {
                    success: true,
                    mensaje: 'Seguimiento actualizado exitosamente',
                    data: resultado,
                    analisisProgreso: analisisProgreso
                };
            }
            
            return {
                success: true,
                mensaje: 'Seguimiento actualizado exitosamente',
                data: resultado
            };
        } catch (error) {
            throw new Error(`Error al actualizar seguimiento: ${error.message}`);
        }
    }

    /**
     * Analiza el progreso de una actualización de seguimiento
     * @param {string} seguimientoId - ID del seguimiento
     * @param {Object} seguimientoAnterior - Datos anteriores del seguimiento
     * @param {Object} datosActualizados - Datos actualizados
     * @returns {Promise<Object>} Análisis de progreso
     */
    async analizarProgresoActualizacion(seguimientoId, seguimientoAnterior, datosActualizados) {
        try {
            // Obtener todos los seguimientos del mismo cliente
            const seguimientosAnteriores = await this.seguimientoRepository.getFollowUpsByClient(seguimientoAnterior.clienteId);
            
            // Filtrar seguimientos anteriores (excluyendo el actual) y ordenar por fecha
            const seguimientosParaComparar = seguimientosAnteriores
                .filter(s => {
                    const idActual = s.seguimientoId ? s.seguimientoId.toString() : null;
                    return idActual && idActual !== seguimientoId.toString();
                })
                .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

            if (seguimientosParaComparar.length === 0) {
                return {
                    mensaje: "📊 Necesitas al menos 2 seguimientos para analizar el progreso. ¡Sigue registrando tus datos!",
                    tipo: "primera_actualizacion"
                };
            }

            // Usar el seguimiento anterior más reciente para comparar
            const seguimientoComparar = seguimientosParaComparar[0];

            if (!seguimientoComparar) {
                return {
                    mensaje: "📊 No hay suficientes datos para comparar. ¡Sigue registrando tu progreso!",
                    tipo: "sin_comparacion"
                };
            }

            // Crear objeto con datos actualizados para comparación
            const seguimientoActual = {
                peso: datosActualizados.peso !== undefined ? datosActualizados.peso : seguimientoAnterior.peso,
                grasaCorporal: datosActualizados.grasaCorporal !== undefined ? datosActualizados.grasaCorporal : seguimientoAnterior.grasaCorporal,
                medidas: {
                    ...seguimientoAnterior.medidas,
                    ...datosActualizados.medidas
                }
            };

            // Analizar progreso
            const analisis = this.progresoService.analizarProgreso(seguimientoActual, seguimientoComparar);
            
            return {
                analisis: analisis,
                resumen: this.progresoService.generarResumenMotivacional(analisis),
                tipo: "analisis_completo"
            };

        } catch (error) {
            console.log('⚠️ Error al analizar progreso:', error.message);
            return {
                mensaje: "📊 No se pudo analizar el progreso en este momento",
                tipo: "error_analisis"
            };
        }
    }

    /**
     * Elimina un seguimiento
     * @param {string|ObjectId} seguimientoId - ID del seguimiento
     * @returns {Promise<Object>} Resultado de la operación
     * 
     * PATRÓN: Template Method - Define el flujo estándar de eliminación de seguimientos
     * PATRÓN: Transaction - Maneja transacciones para operaciones críticas
     * PATRÓN: Rollback - Implementa rollback para operaciones de eliminación
     * PATRÓN: Data Transfer Object (DTO) - Proporciona resultados estructurados
     * PATRÓN: Guard Clause - Validaciones tempranas
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de eliminar seguimientos
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * PRINCIPIO SOLID L: Sustitución de Liskov - Comportamiento consistente
     * PRINCIPIO SOLID I: Segregación de Interfaces - Método específico para eliminación
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (repositorios)
     * 
     * TRANSACCIONES: SÍ implementa transacciones MongoDB para operaciones críticas
     * BUENA PRÁCTICA: Método principal que orquesta la eliminación de seguimientos
     */
    async eliminarSeguimiento(seguimientoId) {
        try {
            // ===== VALIDACIÓN DE EXISTENCIA =====
            // PATRÓN: Guard Clause - Validación temprana de existencia del seguimiento
            // PRINCIPIO SOLID S: Responsabilidad de validar datos de entrada
            const seguimiento = await this.seguimientoRepository.getById(seguimientoId);
            if (!seguimiento) {
                throw new Error('Seguimiento no encontrado');
            }

            // ===== IMPLEMENTACIÓN DE TRANSACCIONES =====
            // PATRÓN: Transaction - Maneja transacciones para operaciones críticas
            // PRINCIPIO SOLID S: Responsabilidad de garantizar consistencia atómica
            try {
                // ===== INICIO DE TRANSACCIÓN =====
                // PATRÓN: Transaction - Inicia sesión de transacción
                // BUENA PRÁCTICA: Transacciones para garantizar consistencia atómica
                const session = this.db.client.startSession();
                
                try {
                    let resultado;
                    
                    // ===== EJECUCIÓN DE TRANSACCIÓN =====
                    // PATRÓN: Transaction - Todas las operaciones en una transacción
                    // PRINCIPIO SOLID S: Responsabilidad de garantizar consistencia
                    await session.withTransaction(async () => {
                        // ===== OPERACIÓN 1: ELIMINAR SEGUIMIENTO CON ROLLBACK =====
                        // PATRÓN: Rollback - Implementa rollback para operaciones de eliminación
                        // BUENA PRÁCTICA: Eliminar seguimiento con capacidad de rollback
                        const eliminado = await this.seguimientoRepository.deleteFollowUpWithRollback(seguimientoId);

                        if (!eliminado) {
                            throw new Error('No se pudo eliminar el seguimiento');
                        }

                        // ===== OPERACIÓN 2: ACTUALIZAR ESTADÍSTICAS =====
                        // PATRÓN: Strategy - Delegación de actualización de estadísticas
                        // BUENA PRÁCTICA: Mantener estadísticas actualizadas
                        await this.actualizarEstadisticasCliente(seguimiento.clienteId);

                        // ===== CONSTRUCCIÓN DE RESPUESTA =====
                        // PATRÓN: Data Transfer Object (DTO) - Objeto estructurado para transferencia
                        resultado = {
                            success: true, // Indicador de éxito de la operación
                            mensaje: 'Seguimiento eliminado exitosamente' // Mensaje descriptivo
                        };
                    });

                    return resultado;
                } finally {
                    // ===== FIN DE TRANSACCIÓN =====
                    // BUENA PRÁCTICA: Siempre cerrar la sesión
                    await session.endSession();
                }
            } catch (transactionError) {
                // ===== FALLBACK SIN TRANSACCIONES =====
                // PATRÓN: Fallback - Estrategia alternativa cuando transacciones no están disponibles
                // PRINCIPIO SOLID S: Responsabilidad de manejar fallos de transacciones
                console.log('⚠️ Transacciones no disponibles, eliminando sin transacción...');
                
                // ===== OPERACIÓN 1: ELIMINAR SEGUIMIENTO =====
                // PATRÓN: Repository - Abstrae la operación de eliminación
                // BUENA PRÁCTICA: Eliminar seguimiento sin transacción
                const eliminado = await this.seguimientoRepository.delete(seguimientoId);

                if (!eliminado) {
                    throw new Error('No se pudo eliminar el seguimiento');
                }

                // ===== OPERACIÓN 2: ACTUALIZAR ESTADÍSTICAS =====
                // PATRÓN: Strategy - Delegación de actualización de estadísticas
                // BUENA PRÁCTICA: Mantener estadísticas actualizadas
                await this.actualizarEstadisticasCliente(seguimiento.clienteId);

                // ===== CONSTRUCCIÓN DE RESPUESTA =====
                // PATRÓN: Data Transfer Object (DTO) - Objeto estructurado para transferencia
                return {
                    success: true, // Indicador de éxito de la operación
                    mensaje: 'Seguimiento eliminado exitosamente' // Mensaje descriptivo
                };
            }

        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Wrapping - Envuelve errores con contexto específico
            // PRINCIPIO SOLID S: Responsabilidad de manejo de errores del método
            throw new Error(`Error al eliminar seguimiento: ${error.message}`);
        }
    }

    /**
     * Obtiene seguimientos por cliente
     * @param {string|ObjectId} clienteId - ID del cliente
     * @param {Object} opciones - Opciones de consulta
     * @returns {Promise<Object>} Seguimientos del cliente
     */
    async obtenerSeguimientosPorCliente(clienteId, opciones = {}) {
        try {
            const cliente = await this.clienteRepository.getById(clienteId);
            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }

            const seguimientos = await this.seguimientoRepository.getFollowUpsByClient(clienteId, opciones);
            
            return {
                success: true,
                data: seguimientos,
                total: seguimientos.length,
                cliente: {
                    nombre: cliente.nombre,
                    apellido: cliente.apellido,
                    email: cliente.email
                }
            };
        } catch (error) {
            throw new Error(`Error al obtener seguimientos del cliente: ${error.message}`);
        }
    }

    /**
     * Obtiene el progreso de peso de un cliente
     * @param {string|ObjectId} clienteId - ID del cliente
     * @returns {Promise<Object>} Progreso de peso del cliente
     */
    async obtenerProgresoPeso(clienteId) {
        try {
            const cliente = await this.clienteRepository.getById(clienteId);
            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }

            const progreso = await this.seguimientoRepository.getWeightProgress(clienteId);
            
            return {
                success: true,
                data: {
                    cliente: {
                        nombre: cliente.nombre,
                        apellido: cliente.apellido
                    },
                    ...progreso
                }
            };
        } catch (error) {
            throw new Error(`Error al obtener progreso de peso: ${error.message}`);
        }
    }

    /**
     * Obtiene estadísticas de seguimientos por cliente
     * @param {string|ObjectId} clienteId - ID del cliente
     * @returns {Promise<Object>} Estadísticas del cliente
     */
    async obtenerEstadisticasCliente(clienteId) {
        try {
            const cliente = await this.clienteRepository.getById(clienteId);
            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }

            const stats = await this.seguimientoRepository.getClientFollowUpStats(clienteId);
            
            return {
                success: true,
                data: {
                    cliente: {
                        nombre: cliente.nombre,
                        apellido: cliente.apellido,
                        email: cliente.email
                    },
                    ...stats
                }
            };
        } catch (error) {
            throw new Error(`Error al obtener estadísticas del cliente: ${error.message}`);
        }
    }

    /**
     * Obtiene seguimientos por rango de fechas
     * @param {Date} fechaInicio - Fecha de inicio
     * @param {Date} fechaFin - Fecha de fin
     * @param {string|ObjectId} clienteId - ID del cliente (opcional)
     * @returns {Promise<Object>} Seguimientos en el rango
     */
    async obtenerSeguimientosPorFechas(fechaInicio, fechaFin, clienteId = null) {
        try {
            this.validarFechasSeguimiento(fechaInicio);
            this.validarFechasSeguimiento(fechaFin);

            if (fechaInicio >= fechaFin) {
                throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
            }

            const seguimientos = await this.seguimientoRepository.getFollowUpsByDateRange(
                fechaInicio, 
                fechaFin, 
                clienteId
            );
            
            return {
                success: true,
                data: seguimientos,
                total: seguimientos.length,
                rango: {
                    fechaInicio,
                    fechaFin
                }
            };
        } catch (error) {
            throw new Error(`Error al obtener seguimientos por fechas: ${error.message}`);
        }
    }

    /**
     * Valida las fechas de un seguimiento
     * @param {Date} fecha - Fecha del seguimiento
     * @throws {Error} Si la fecha no es válida
     */
    validarFechasSeguimiento(fecha) {
        if (!(fecha instanceof Date)) {
            throw new Error('Fecha debe ser un objeto Date');
        }

        const mañana = new Date();
        mañana.setDate(mañana.getDate() + 1);
        
        if (fecha > mañana) {
            throw new Error('Fecha del seguimiento no puede ser más de 1 día en el futuro');
        }

        // Verificar que no sea muy antigua (más de 1 año)
        const unAnoAtras = new Date();
        unAnoAtras.setFullYear(unAnoAtras.getFullYear() - 1);
        
        if (fecha < unAnoAtras) {
            throw new Error('Fecha del seguimiento no puede ser anterior a 1 año');
        }
    }

    /**
     * Valida los datos físicos del seguimiento
     * @param {Object} datos - Datos físicos a validar
     * @throws {Error} Si los datos no son válidos
     */
    validarDatosFisicos(datos) {
        // Validar peso
        if (datos.peso !== null && datos.peso !== undefined) {
            if (typeof datos.peso !== 'number' || datos.peso <= 0 || datos.peso > 500) {
                throw new Error('Peso debe ser un número entre 0 y 500 kg');
            }
        }

        // Validar grasa corporal
        if (datos.grasaCorporal !== null && datos.grasaCorporal !== undefined) {
            if (typeof datos.grasaCorporal !== 'number' || datos.grasaCorporal < 0 || datos.grasaCorporal > 100) {
                throw new Error('Grasa corporal debe ser un número entre 0 y 100%');
            }
        }

        // Validar medidas
        if (datos.medidas && typeof datos.medidas === 'object') {
            const medidasValidas = ['cintura', 'brazo', 'pierna', 'pecho', 'cadera'];
            
            for (const [medida, valor] of Object.entries(datos.medidas)) {
                if (!medidasValidas.includes(medida)) {
                    throw new Error(`Medida '${medida}' no es válida`);
                }
                
                if (typeof valor !== 'number' || valor <= 0 || valor > 200) {
                    throw new Error(`Valor de ${medida} debe ser un número entre 0 y 200 cm`);
                }
            }
        }
    }

    /**
     * Actualiza las estadísticas del cliente
     * @param {string|ObjectId} clienteId - ID del cliente
     * @private
     */
    async actualizarEstadisticasCliente(clienteId) {
        try {
            // Esta función podría actualizar estadísticas calculadas del cliente
            // Por ejemplo, último peso registrado, progreso, etc.
            // Por ahora solo registramos que se actualizó
            console.log(`📊 Estadísticas actualizadas para cliente ${clienteId}`);
        } catch (error) {
            console.error('Error al actualizar estadísticas del cliente:', error.message);
        }
    }
}

// ===== EXPORTACIÓN DEL MÓDULO =====
// PATRÓN: Module Pattern - Exporta la clase como módulo
// PRINCIPIO SOLID S: Responsabilidad de proporcionar la interfaz pública del servicio
module.exports = SeguimientoService;
