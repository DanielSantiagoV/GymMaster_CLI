// ===== IMPORTS Y DEPENDENCIAS =====
// Importación de utilidades y modelos de dominio
// PATRÓN: Dependency Injection - Se inyectan las dependencias a través del constructor
// PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (repositorios) no de implementaciones concretas
const { ObjectId } = require('mongodb'); // Utilidad para manejo de IDs de MongoDB
const { Contrato } = require('../models'); // Modelo de dominio para entidad Contrato
const ContratoRepository = require('../repositories/ContratoRepository'); // Repositorio para operaciones CRUD de contratos
const ClienteRepository = require('../repositories/ClienteRepository'); // Repositorio para operaciones de clientes
const PlanEntrenamientoRepository = require('../repositories/PlanEntrenamientoRepository'); // Repositorio para operaciones de planes
const FinanzasRepository = require('../repositories/FinanzasRepository'); // Repositorio para operaciones financieras

/**
 * Servicio para gestión de contratos
 * Implementa lógica de negocio para contratos siguiendo principios SOLID
 * Maneja validaciones, transacciones y coordinación con otros módulos
 * 
 * PATRÓN: Service Layer - Capa de servicio que orquesta la lógica de negocio
 * PATRÓN: Facade - Proporciona una interfaz simplificada para operaciones complejas de contratos
 * PRINCIPIO SOLID S: Responsabilidad Única - Se encarga únicamente de la lógica de negocio de contratos
 * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (repositorios) no de implementaciones concretas
 */
class ContratoService {
    /**
     * Constructor del servicio de contratos
     * @param {Object} db - Instancia de la base de datos (MongoDB)
     * 
     * PATRÓN: Dependency Injection - Recibe las dependencias como parámetros
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones, no de implementaciones concretas
     * BUENA PRÁCTICA: Inicialización de repositorios en el constructor para reutilización
     */
    constructor(db) {
        // Almacena la conexión a la base de datos para uso interno
        this.db = db;
        // PATRÓN: Repository - Abstrae el acceso a datos de contratos
        // PRINCIPIO SOLID D: Depende de abstracción ContratoRepository
        this.contratoRepository = new ContratoRepository(db);
        // PATRÓN: Repository - Abstrae el acceso a datos de clientes
        // PRINCIPIO SOLID D: Depende de abstracción ClienteRepository
        this.clienteRepository = new ClienteRepository(db);
        // PATRÓN: Repository - Abstrae el acceso a datos de planes
        // PRINCIPIO SOLID D: Depende de abstracción PlanEntrenamientoRepository
        this.planRepository = new PlanEntrenamientoRepository(db);
        // PATRÓN: Repository - Abstrae el acceso a datos financieros
        // PRINCIPIO SOLID D: Depende de abstracción FinanzasRepository
        this.finanzasRepository = new FinanzasRepository(db);
    }

    /**
     * Crea un nuevo contrato con validaciones de negocio
     * @param {Object} datosContrato - Datos del contrato a crear
     * @returns {Promise<Object>} Resultado de la operación
     * 
     * PATRÓN: Template Method - Define el flujo estándar de creación de contratos
     * PATRÓN: Factory - Crea instancias de Contrato
     * PATRÓN: Data Transfer Object (DTO) - Retorna objeto estructurado
     * PATRÓN: Transaction - Maneja transacciones para operaciones críticas
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de crear contratos
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * 
     * TRANSACCIONES: Este método implementa transacciones explícitas para garantizar consistencia
     * INICIO TRANSACCIÓN: Línea 74 - session.startSession()
     * FIN TRANSACCIÓN: Línea 108 - session.endSession()
     * OPERACIONES EN TRANSACCIÓN: Creación de contrato, asociaciones y registro financiero
     */
    async crearContrato(datosContrato) {
        try {
            // ===== VALIDACIONES DE EXISTENCIA =====
            // PATRÓN: Guard Clause - Validación temprana de existencia
            // PRINCIPIO SOLID S: Responsabilidad de validación de dependencias
            const cliente = await this.clienteRepository.getById(datosContrato.clienteId);
            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }

            const plan = await this.planRepository.getById(datosContrato.planId);
            if (!plan) {
                throw new Error('Plan no encontrado');
            }

            // PATRÓN: Guard Clause - Validación de estado del plan
            if (!plan.estaActivo()) {
                throw new Error('Solo se pueden crear contratos con planes activos');
            }

            // ===== VALIDACIÓN DE UNICIDAD =====
            // PATRÓN: Repository - Consulta de unicidad a través de abstracción
            // PRINCIPIO SOLID D: Depende de abstracción ContratoRepository
            const contratosExistentes = await this.contratoRepository.getContractsByClientAndPlan(
                datosContrato.clienteId, 
                datosContrato.planId
            );
            // PATRÓN: Guard Clause - Validación de unicidad
            const contratoVigente = contratosExistentes.find(c => c.estado === 'vigente');
            if (contratoVigente) {
                throw new Error('Ya existe un contrato vigente para este cliente y plan');
            }

            // ===== VALIDACIONES DE NEGOCIO =====
            // PATRÓN: Template Method - Delegación de validaciones específicas
            // PRINCIPIO SOLID S: Separación de responsabilidades - validación delegada
            this.validarFechasContrato(datosContrato.fechaInicio, datosContrato.fechaFin);

            // PATRÓN: Guard Clause - Validación de precio
            if (!datosContrato.precio || datosContrato.precio <= 0) {
                throw new Error('El precio debe ser mayor a cero');
            }

            // ===== CREACIÓN DE ENTIDAD DE DOMINIO =====
            // PATRÓN: Factory - Creación de instancia de Contrato
            // PATRÓN: Domain Model - Uso de entidad de dominio con validaciones
            // PRINCIPIO SOLID S: Delegación de responsabilidad de validación al modelo
            const contrato = new Contrato({
                clienteId: datosContrato.clienteId,
                planId: datosContrato.planId,
                condiciones: datosContrato.condiciones || '',
                duracionMeses: datosContrato.duracionMeses,
                precio: datosContrato.precio,
                fechaInicio: datosContrato.fechaInicio,
                fechaFin: datosContrato.fechaFin
            });

            // ===== INICIO DE TRANSACCIÓN =====
            // PATRÓN: Transaction - Manejo de transacciones para operaciones críticas
            // BUENA PRÁCTICA: Transacciones para garantizar consistencia atómica
            const session = this.db.client.startSession();
            
            try {
                let resultado;
                
                // ===== EJECUCIÓN DE TRANSACCIÓN =====
                // PATRÓN: Transaction - Todas las operaciones en una transacción
                // PRINCIPIO SOLID S: Responsabilidad de garantizar consistencia
                await session.withTransaction(async () => {
                    // ===== OPERACIÓN 1: CREAR CONTRATO =====
                    // PATRÓN: Repository - Abstrae la operación de inserción
                    // PRINCIPIO SOLID D: Depende de abstracción, no de implementación concreta
                    const contratoId = await this.contratoRepository.create(contrato);

                    // ===== OPERACIÓN 2: ASOCIAR PLAN AL CLIENTE =====
                    // PATRÓN: Repository - Abstrae la operación de asociación
                    // BUENA PRÁCTICA: Mantener consistencia bidireccional
                    await this.clienteRepository.addPlanToClient(datosContrato.clienteId, datosContrato.planId);

                    // ===== OPERACIÓN 3: ASOCIAR CLIENTE AL PLAN =====
                    // PATRÓN: Repository - Abstrae la operación de asociación
                    // BUENA PRÁCTICA: Mantener consistencia bidireccional
                    await this.planRepository.addClientToPlan(datosContrato.planId, datosContrato.clienteId);

                    // ===== OPERACIÓN 4: REGISTRO FINANCIERO OPCIONAL =====
                    // PATRÓN: Strategy - Diferentes estrategias según registrarPago
                    // PATRÓN: Factory - Creación de instancia de Finanzas
                    if (datosContrato.registrarPago) {
                        const { Finanzas } = require('../models');
                        const movimientoFinanciero = new Finanzas({
                            tipo: 'ingreso',
                            descripcion: `Pago contrato - ${plan.nombre}`,
                            monto: datosContrato.precio,
                            fecha: new Date(),
                            clienteId: datosContrato.clienteId,
                            categoria: 'contrato'
                        });
                        await this.finanzasRepository.create(movimientoFinanciero);
                    }

                    // ===== CONSTRUCCIÓN DE RESPUESTA =====
                    // PATRÓN: Data Transfer Object (DTO) - Objeto estructurado para transferencia
                    resultado = {
                        success: true,
                        contratoId: contratoId,
                        mensaje: 'Contrato creado exitosamente'
                    };
                });

                return resultado;
            } finally {
                // ===== FIN DE TRANSACCIÓN =====
                // BUENA PRÁCTICA: Siempre cerrar la sesión
                await session.endSession();
            }

        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Wrapping - Envuelve errores con contexto específico
            // PRINCIPIO SOLID S: Responsabilidad de manejo de errores del método
            throw new Error(`Error al crear contrato: ${error.message}`);
        }
    }

    /**
     * Lista contratos con filtros opcionales
     * @param {Object} filtros - Filtros de búsqueda
     * @param {Object} opciones - Opciones de paginación
     * @returns {Promise<Object>} Lista de contratos
     */
    async listarContratos(filtros = {}, opciones = {}) {
        try {
            const contratos = await this.contratoRepository.getContracts(filtros, opciones);
            
            // Enriquecer con información de cliente y plan
            const contratosEnriquecidos = await Promise.all(
                contratos.map(async (contrato) => {
                    const cliente = await this.clienteRepository.getById(contrato.clienteId);
                    const plan = await this.planRepository.getById(contrato.planId);
                    
                    return {
                        ...contrato,
                        cliente: cliente ? {
                            nombre: cliente.nombre,
                            apellido: cliente.apellido,
                            email: cliente.email
                        } : null,
                        plan: plan ? {
                            nombre: plan.nombre,
                            nivel: plan.nivel,
                            duracionSemanas: plan.duracionSemanas
                        } : null
                    };
                })
            );

            return {
                success: true,
                data: contratosEnriquecidos,
                total: contratosEnriquecidos.length
            };
        } catch (error) {
            throw new Error(`Error al listar contratos: ${error.message}`);
        }
    }

    /**
     * Obtiene un contrato por ID con información completa
     * @param {string|ObjectId} contratoId - ID del contrato
     * @returns {Promise<Object>} Contrato con información completa
     */
    async obtenerContrato(contratoId) {
        try {
            const contrato = await this.contratoRepository.getById(contratoId);
            if (!contrato) {
                throw new Error('Contrato no encontrado');
            }

            // Obtener información del cliente y plan
            const cliente = await this.clienteRepository.getById(contrato.clienteId);
            const plan = await this.planRepository.getById(contrato.planId);

            return {
                success: true,
                data: {
                    _id: contrato.contratoId,
                    contratoId: contrato.contratoId,
                    clienteId: contrato.clienteId,
                    planId: contrato.planId,
                    condiciones: contrato.condiciones,
                    duracionMeses: contrato.duracionMeses,
                    precio: contrato.precio,
                    fechaInicio: contrato.fechaInicio,
                    fechaFin: contrato.fechaFin,
                    estado: contrato.estado,
                    cliente: cliente ? {
                        nombre: cliente.nombre,
                        apellido: cliente.apellido,
                        email: cliente.email,
                        telefono: cliente.telefono
                    } : null,
                    plan: plan ? {
                        nombre: plan.nombre,
                        nivel: plan.nivel,
                        duracionSemanas: plan.duracionSemanas,
                        metasFisicas: plan.metasFisicas
                    } : null
                }
            };
        } catch (error) {
            throw new Error(`Error al obtener contrato: ${error.message}`);
        }
    }

    /**
     * Actualiza un contrato existente
     * @param {string|ObjectId} contratoId - ID del contrato
     * @param {Object} datosActualizados - Datos a actualizar
     * @returns {Promise<Object>} Resultado de la operación
     */
    async actualizarContrato(contratoId, datosActualizados) {
        try {
            const contrato = await this.contratoRepository.getById(contratoId);
            if (!contrato) {
                throw new Error('Contrato no encontrado');
            }

            // Validar que el contrato se puede actualizar
            if (contrato.estado === 'cancelado') {
                throw new Error('No se puede actualizar un contrato cancelado');
            }

            // Validar fechas si se actualizan
            if (datosActualizados.fechaInicio || datosActualizados.fechaFin) {
                this.validarFechasContrato(
                    datosActualizados.fechaInicio || contrato.fechaInicio,
                    datosActualizados.fechaFin || contrato.fechaFin
                );
            }

            // Validar precio si se actualiza
            if (datosActualizados.precio && datosActualizados.precio <= 0) {
                throw new Error('El precio debe ser mayor a cero');
            }

            const resultado = await this.contratoRepository.update(contratoId, datosActualizados);
            
            return {
                success: true,
                mensaje: 'Contrato actualizado exitosamente',
                data: resultado
            };
        } catch (error) {
            throw new Error(`Error al actualizar contrato: ${error.message}`);
        }
    }

    /**
     * Cancela un contrato
     * @param {string|ObjectId} contratoId - ID del contrato
     * @param {string} motivo - Motivo de la cancelación
     * @returns {Promise<Object>} Resultado de la operación
     * 
     * PATRÓN: Template Method - Define el flujo estándar de cancelación
     * PATRÓN: Data Transfer Object (DTO) - Retorna objeto estructurado
     * PATRÓN: Transaction - Maneja transacciones para operaciones críticas
     * PATRÓN: Rollback - Manejo de rollback en cancelaciones
     * PATRÓN: Circuit Breaker - Manejo de errores en rollback
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de cancelar contratos
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * 
     * TRANSACCIONES: Este método implementa transacciones explícitas con rollback
     * INICIO TRANSACCIÓN: Línea 275 - session.startSession()
     * FIN TRANSACCIÓN: Línea 319 - session.endSession()
     * OPERACIONES EN TRANSACCIÓN: Cancelación, desasociaciones y rollback de seguimientos
     */
    async cancelarContrato(contratoId, motivo = '') {
        try {
            // ===== VALIDACIÓN DE EXISTENCIA =====
            // PATRÓN: Repository - Consulta de existencia a través de abstracción
            // PRINCIPIO SOLID D: Depende de abstracción ContratoRepository
            const contrato = await this.contratoRepository.getById(contratoId);
            // PATRÓN: Guard Clause - Validación temprana de existencia
            if (!contrato) {
                throw new Error('Contrato no encontrado');
            }

            // ===== VALIDACIONES DE ESTADO =====
            // PATRÓN: Guard Clause - Validación de estado del contrato
            // PRINCIPIO SOLID S: Responsabilidad de validación de estado
            if (contrato.estado === 'cancelado') {
                throw new Error('El contrato ya está cancelado');
            }

            if (contrato.estado === 'renovado') {
                throw new Error('No se puede cancelar un contrato renovado');
            }

            // ===== INICIO DE TRANSACCIÓN =====
            // PATRÓN: Transaction - Manejo de transacciones para operaciones críticas
            // BUENA PRÁCTICA: Transacciones para garantizar consistencia atómica
            const session = this.db.client.startSession();
            
            try {
                let resultado;
                
                // ===== EJECUCIÓN DE TRANSACCIÓN =====
                // PATRÓN: Transaction - Todas las operaciones en una transacción
                // PRINCIPIO SOLID S: Responsabilidad de garantizar consistencia
                await session.withTransaction(async () => {
                    // ===== OPERACIÓN 1: CANCELAR CONTRATO =====
                    // PATRÓN: Repository - Abstrae la operación de actualización
                    // PRINCIPIO SOLID D: Depende de abstracción, no de implementación concreta
                    await this.contratoRepository.update(contratoId, { 
                        estado: 'cancelado',
                        motivoCancelacion: motivo
                    });

                    // ===== OPERACIÓN 2: DESASOCIAR PLAN DEL CLIENTE =====
                    // PATRÓN: Repository - Abstrae la operación de desasociación
                    // BUENA PRÁCTICA: Mantener consistencia bidireccional
                    await this.clienteRepository.removePlanFromClient(contrato.clienteId, contrato.planId);

                    // ===== OPERACIÓN 3: DESASOCIAR CLIENTE DEL PLAN =====
                    // PATRÓN: Repository - Abstrae la operación de desasociación
                    // BUENA PRÁCTICA: Mantener consistencia bidireccional
                    await this.planRepository.removeClientFromPlan(contrato.planId, contrato.clienteId);

                    // ===== OPERACIÓN 4: ROLLBACK DE SEGUIMIENTOS =====
                    // PATRÓN: Rollback - Eliminación de seguimientos con rollback
                    // PATRÓN: Circuit Breaker - Manejo de errores en rollback
                    // PATRÓN: Repository - Acceso a datos a través de abstracción
                    const { SeguimientoRepository } = require('../repositories');
                    const seguimientoRepository = new SeguimientoRepository(this.db);
                    
                    try {
                        // PATRÓN: Rollback - Eliminación con registro de rollback
                        const rollbackSeguimientos = await seguimientoRepository.deleteFollowUpsByContractWithRollback(
                            contratoId, 
                            `Cancelación de contrato: ${motivo}`
                        );
                        
                        // PATRÓN: Guard Clause - Validación de resultado de rollback
                        if (rollbackSeguimientos.success && rollbackSeguimientos.eliminados > 0) {
                            console.log(`✅ Rollback completado: ${rollbackSeguimientos.eliminados} seguimientos eliminados`);
                        }
                    } catch (rollbackError) {
                        // ===== MANEJO DE ERRORES EN ROLLBACK =====
                        // PATRÓN: Circuit Breaker - Continúa ejecución aunque falle rollback
                        // PATRÓN: Error Logging - Registro de errores para debugging
                        // BUENA PRÁCTICA: No fallar la cancelación por errores en rollback
                        console.log(`⚠️ Error en rollback de seguimientos: ${rollbackError.message}`);
                    }

                    // ===== CONSTRUCCIÓN DE RESPUESTA =====
                    // PATRÓN: Data Transfer Object (DTO) - Objeto estructurado para transferencia
                    resultado = {
                        success: true,
                        mensaje: 'Contrato cancelado exitosamente con rollback de seguimientos'
                    };
                });

                return resultado;
            } finally {
                // ===== FIN DE TRANSACCIÓN =====
                // BUENA PRÁCTICA: Siempre cerrar la sesión
                await session.endSession();
            }

        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Wrapping - Envuelve errores con contexto específico
            // PRINCIPIO SOLID S: Responsabilidad de manejo de errores del método
            throw new Error(`Error al cancelar contrato: ${error.message}`);
        }
    }

    /**
     * Renueva un contrato
     * @param {string|ObjectId} contratoId - ID del contrato a renovar
     * @param {Object} datosRenovacion - Datos de la renovación
     * @returns {Promise<Object>} Resultado de la operación
     * 
     * PATRÓN: Template Method - Define el flujo estándar de renovación
     * PATRÓN: Factory - Crea instancias de Contrato
     * PATRÓN: Data Transfer Object (DTO) - Retorna objeto estructurado
     * PATRÓN: Transaction - Maneja transacciones para operaciones críticas
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de renovar contratos
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * 
     * TRANSACCIONES: Este método implementa transacciones explícitas para garantizar consistencia
     * INICIO TRANSACCIÓN: Línea 353 - session.startSession()
     * FIN TRANSACCIÓN: Línea 388 - session.endSession()
     * OPERACIONES EN TRANSACCIÓN: Actualización de contrato anterior y creación de nuevo contrato
     */
    async renovarContrato(contratoId, datosRenovacion) {
        try {
            // ===== VALIDACIÓN DE EXISTENCIA =====
            // PATRÓN: Repository - Consulta de existencia a través de abstracción
            // PRINCIPIO SOLID D: Depende de abstracción ContratoRepository
            const contrato = await this.contratoRepository.getById(contratoId);
            // PATRÓN: Guard Clause - Validación temprana de existencia
            if (!contrato) {
                throw new Error('Contrato no encontrado');
            }

            // ===== VALIDACIONES DE ESTADO =====
            // PATRÓN: Guard Clause - Validación de estado del contrato
            // PRINCIPIO SOLID S: Responsabilidad de validación de estado
            if (contrato.estado !== 'vigente' && contrato.estado !== 'vencido') {
                throw new Error('Solo se pueden renovar contratos vigentes o vencidos');
            }

            // ===== VALIDACIONES DE NEGOCIO =====
            // PATRÓN: Template Method - Delegación de validaciones específicas
            // PRINCIPIO SOLID S: Separación de responsabilidades - validación delegada
            this.validarFechasContrato(datosRenovacion.fechaInicio, datosRenovacion.fechaFin);

            // PATRÓN: Guard Clause - Validación de precio
            if (!datosRenovacion.precio || datosRenovacion.precio <= 0) {
                throw new Error('El precio debe ser mayor a cero');
            }

            // ===== INICIO DE TRANSACCIÓN =====
            // PATRÓN: Transaction - Manejo de transacciones para operaciones críticas
            // BUENA PRÁCTICA: Transacciones para garantizar consistencia atómica
            const session = this.db.client.startSession();
            
            try {
                let resultado;
                
                // ===== EJECUCIÓN DE TRANSACCIÓN =====
                // PATRÓN: Transaction - Todas las operaciones en una transacción
                // PRINCIPIO SOLID S: Responsabilidad de garantizar consistencia
                await session.withTransaction(async () => {
                    // ===== OPERACIÓN 1: MARCAR CONTRATO ANTERIOR COMO RENOVADO =====
                    // PATRÓN: Repository - Abstrae la operación de actualización
                    // PRINCIPIO SOLID D: Depende de abstracción, no de implementación concreta
                    await this.contratoRepository.update(contratoId, { 
                        estado: 'renovado',
                        fechaRenovacion: new Date()
                    });

                    // ===== OPERACIÓN 2: CREAR NUEVO CONTRATO =====
                    // PATRÓN: Factory - Creación de instancia de Contrato
                    // PATRÓN: Domain Model - Uso de entidad de dominio con validaciones
                    // PRINCIPIO SOLID S: Delegación de responsabilidad de validación al modelo
                    const nuevoContrato = new Contrato({
                        clienteId: contrato.clienteId,
                        planId: contrato.planId,
                        condiciones: datosRenovacion.condiciones || contrato.condiciones,
                        duracionMeses: datosRenovacion.duracionMeses,
                        precio: datosRenovacion.precio,
                        fechaInicio: datosRenovacion.fechaInicio,
                        fechaFin: datosRenovacion.fechaFin,
                        contratoAnterior: contratoId
                    });

                    // PATRÓN: Repository - Abstrae la operación de inserción
                    // PRINCIPIO SOLID D: Depende de abstracción, no de implementación concreta
                    const nuevoContratoId = await this.contratoRepository.create(nuevoContrato);

                    // ===== CONSTRUCCIÓN DE RESPUESTA =====
                    // PATRÓN: Data Transfer Object (DTO) - Objeto estructurado para transferencia
                    resultado = {
                        success: true,
                        contratoId: nuevoContratoId,
                        mensaje: 'Contrato renovado exitosamente'
                    };
                });

                return resultado;
            } finally {
                // ===== FIN DE TRANSACCIÓN =====
                // BUENA PRÁCTICA: Siempre cerrar la sesión
                await session.endSession();
            }

        } catch (error) {
            // ===== MANEJO DE ERRORES =====
            // PATRÓN: Error Wrapping - Envuelve errores con contexto específico
            // PRINCIPIO SOLID S: Responsabilidad de manejo de errores del método
            throw new Error(`Error al renovar contrato: ${error.message}`);
        }
    }

    /**
     * Obtiene estadísticas de contratos
     * @returns {Promise<Object>} Estadísticas de contratos
     */
    async obtenerEstadisticasContratos() {
        try {
            const totalContratos = await this.contratoRepository.countContracts();
            const contratosVigentes = await this.contratoRepository.countContracts({ estado: 'vigente' });
            const contratosVencidos = await this.contratoRepository.countContracts({ estado: 'vencido' });
            const contratosCancelados = await this.contratoRepository.countContracts({ estado: 'cancelado' });
            const contratosRenovados = await this.contratoRepository.countContracts({ estado: 'renovado' });

            // Calcular ingresos totales
            const contratosVigentesData = await this.contratoRepository.getContracts({ estado: 'vigente' });
            const ingresosTotales = contratosVigentesData.reduce((total, contrato) => total + contrato.precio, 0);

            return {
                success: true,
                data: {
                    total: totalContratos,
                    vigentes: contratosVigentes,
                    vencidos: contratosVencidos,
                    cancelados: contratosCancelados,
                    renovados: contratosRenovados,
                    ingresosTotales: ingresosTotales
                }
            };
        } catch (error) {
            throw new Error(`Error al obtener estadísticas: ${error.message}`);
        }
    }

    /**
     * Obtiene todos los contratos de un cliente específico
     * @param {string|ObjectId} clienteId - ID del cliente
     * @returns {Promise<Object>} Lista de contratos del cliente
     */
    async obtenerContratosPorCliente(clienteId) {
        try {
            const contratos = await this.contratoRepository.getContractsByClient(clienteId);
            
            return {
                success: true,
                data: contratos.map(contrato => ({
                    contratoId: contrato.contratoId,
                    planId: contrato.planId,
                    estado: contrato.estado,
                    fechaInicio: contrato.fechaInicio,
                    fechaFin: contrato.fechaFin,
                    precio: contrato.precio,
                    duracionMeses: contrato.duracionMeses,
                    condiciones: contrato.condiciones || '',
                    fechaCreacion: contrato.fechaCreacion
                })),
                total: contratos.length
            };
        } catch (error) {
            throw new Error(`Error al obtener contratos del cliente: ${error.message}`);
        }
    }

    /**
     * Valida las fechas de un contrato
     * @param {Date} fechaInicio - Fecha de inicio
     * @param {Date} fechaFin - Fecha de fin
     * @throws {Error} Si las fechas no son válidas
     * 
     * PATRÓN: Template Method - Define el flujo estándar de validación de fechas
     * PATRÓN: Guard Clause - Validaciones tempranas
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de validar fechas
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     */
    validarFechasContrato(fechaInicio, fechaFin) {
        // ===== CONVERSIÓN DE FECHAS =====
        // BUENA PRÁCTICA: Normalización de fechas para comparaciones
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        const hoy = new Date();

        // ===== VALIDACIÓN DE ORDEN DE FECHAS =====
        // PATRÓN: Guard Clause - Validación temprana de orden
        // PRINCIPIO SOLID S: Responsabilidad de validación de orden
        if (inicio >= fin) {
            throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
        }

        // ===== VALIDACIÓN DE FECHA FUTURA =====
        // PATRÓN: Guard Clause - Validación temprana de fecha futura
        // PRINCIPIO SOLID S: Responsabilidad de validación de fecha futura
        if (fin <= hoy) {
            throw new Error('La fecha de fin debe ser futura');
        }
    }
}

// ===== EXPORTACIÓN DEL MÓDULO =====
// PATRÓN: Module Pattern - Exporta la clase como módulo
// PRINCIPIO SOLID S: Responsabilidad de proporcionar la interfaz pública del servicio
module.exports = ContratoService;
