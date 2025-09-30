// ===== IMPORTS Y DEPENDENCIAS =====
// Importación de utilidades y modelos de dominio
// PATRÓN: Dependency Injection - Se inyectan las dependencias a través del constructor
// PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (repositorios) no de implementaciones concretas
const { ObjectId } = require('mongodb'); // Utilidad para manejo de IDs de MongoDB
const { PlanEntrenamiento } = require('../models'); // Modelo de dominio para entidad PlanEntrenamiento
const { Contrato } = require('../models'); // Modelo de dominio para entidad Contrato
const PlanEntrenamientoRepository = require('../repositories/PlanEntrenamientoRepository'); // Repositorio para operaciones CRUD de planes de entrenamiento
const ContratoRepository = require('../repositories/ContratoRepository'); // Repositorio para operaciones CRUD de contratos
const ClienteRepository = require('../repositories/ClienteRepository'); // Repositorio para operaciones CRUD de clientes

/**
 * Servicio para gestión de planes de clientes
 * Implementa lógica de negocio para asociar/desasociar planes con clientes
 * Maneja generación automática de contratos y transacciones
 * 
 * PATRÓN: Service Layer - Capa de servicio que orquesta la lógica de negocio de planes-cliente
 * PATRÓN: Facade - Proporciona una interfaz simplificada para operaciones complejas de planes-cliente
 * PRINCIPIO SOLID S: Responsabilidad Única - Se encarga únicamente de la lógica de negocio de planes-cliente
 * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones (repositorios) no de implementaciones concretas
 */
class PlanClienteService {
    /**
     * Constructor del servicio de planes-cliente
     * @param {Object} db - Instancia de la base de datos (MongoDB)
     * 
     * PATRÓN: Dependency Injection - Recibe las dependencias como parámetros
     * PRINCIPIO SOLID D: Inversión de Dependencias - Depende de abstracciones, no de implementaciones concretas
     * BUENA PRÁCTICA: Inicialización de repositorios en el constructor para reutilización
     */
    constructor(db) {
        // Almacena la conexión a la base de datos para uso interno
        this.db = db;
        // PATRÓN: Repository - Abstrae el acceso a datos de planes de entrenamiento
        // PRINCIPIO SOLID D: Depende de abstracción PlanEntrenamientoRepository
        this.planRepository = new PlanEntrenamientoRepository(db);
        // PATRÓN: Repository - Abstrae el acceso a datos de contratos
        // PRINCIPIO SOLID D: Depende de abstracción ContratoRepository
        this.contratoRepository = new ContratoRepository(db);
        // PATRÓN: Repository - Abstrae el acceso a datos de clientes
        // PRINCIPIO SOLID D: Depende de abstracción ClienteRepository
        this.clienteRepository = new ClienteRepository(db);
    }

    /**
     * Asocia un plan a un cliente y genera contrato automáticamente
     * @param {string|ObjectId} clienteId - ID del cliente
     * @param {string|ObjectId} planId - ID del plan
     * @param {Object} datosContrato - Datos del contrato (precio, duración, condiciones)
     * @returns {Promise<Object>} Resultado de la operación
     * 
     * PATRÓN: Template Method - Define el flujo estándar de asociación de planes
     * PATRÓN: Factory - Crea instancias de Contrato
     * PATRÓN: Data Transfer Object (DTO) - Retorna objeto estructurado
     * PATRÓN: Guard Clause - Validaciones tempranas
     * PATRÓN: Transaction - Maneja transacciones para operaciones críticas
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de asociar planes a clientes
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * 
     * TRANSACCIONES: Este método implementa transacciones explícitas
     * INICIO TRANSACCIÓN: Línea 65 - session.startSession()
     * FIN TRANSACCIÓN: Línea 99 - session.endSession()
     * OPERACIONES EN TRANSACCIÓN: Creación de contrato, asociaciones bidireccionales
     */
    async asociarPlanACliente(clienteId, planId, datosContrato) {
        try {
            // ===== VALIDACIONES DE ENTRADA =====
            // PATRÓN: Guard Clause - Validación temprana de IDs
            // PRINCIPIO SOLID S: Responsabilidad de validación de entrada
            if (!ObjectId.isValid(clienteId) || !ObjectId.isValid(planId)) {
                throw new Error('IDs de cliente y plan deben ser ObjectIds válidos');
            }

            // ===== VALIDACIÓN DE EXISTENCIA DE CLIENTE =====
            // PATRÓN: Repository - Consulta de existencia a través de abstracción
            // PRINCIPIO SOLID D: Depende de abstracción ClienteRepository
            const cliente = await this.clienteRepository.getById(clienteId);
            // PATRÓN: Guard Clause - Validación de existencia del cliente
            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }

            // ===== VALIDACIÓN DE EXISTENCIA DE PLAN =====
            // PATRÓN: Repository - Consulta de existencia a través de abstracción
            // PRINCIPIO SOLID D: Depende de abstracción PlanEntrenamientoRepository
            const plan = await this.planRepository.getById(planId);
            // PATRÓN: Guard Clause - Validación de existencia del plan
            if (!plan) {
                throw new Error('Plan no encontrado');
            }

            // ===== VALIDACIÓN DE ESTADO DEL PLAN =====
            // PATRÓN: Guard Clause - Validación de estado del plan
            // PRINCIPIO SOLID S: Responsabilidad de validación de reglas de negocio
            if (!plan.estaActivo()) {
                throw new Error('Solo se pueden asignar planes activos');
            }

            // ===== VALIDACIÓN DE COMPATIBILIDAD =====
            // PATRÓN: Guard Clause - Validación de compatibilidad de nivel
            // PRINCIPIO SOLID S: Responsabilidad de validación de reglas de negocio
            if (!plan.esCompatibleConNivel(cliente.nivel)) {
                throw new Error(`El plan no es compatible con el nivel del cliente (${cliente.nivel})`);
            }

            // ===== VALIDACIÓN DE UNICIDAD =====
            // PATRÓN: Guard Clause - Validación de unicidad de contrato activo
            // PRINCIPIO SOLID S: Responsabilidad de validación de reglas de negocio
            const contratosExistentes = await this.contratoRepository.getContractsByClientAndPlan(clienteId, planId);
            const contratoActivo = contratosExistentes.find(c => c.estado === 'vigente');
            if (contratoActivo) {
                throw new Error('Ya existe un contrato activo para este cliente y plan');
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
                    // ===== OPERACIÓN 1: CREAR CONTRATO =====
                    // PATRÓN: Factory - Creación de instancia de Contrato
                    // PATRÓN: Domain Model - Uso de entidad de dominio con validaciones
                    // PRINCIPIO SOLID S: Delegación de responsabilidad de validación al modelo
                    const contrato = new Contrato({
                        clienteId: new ObjectId(clienteId),
                        planId: new ObjectId(planId),
                        condiciones: datosContrato.condiciones || `Contrato automático para ${plan.nombre}`,
                        duracionMeses: datosContrato.duracionMeses || 1,
                        precio: datosContrato.precio || 0,
                        fechaInicio: new Date()
                    });

                    // PATRÓN: Repository - Abstrae la operación de inserción
                    // PRINCIPIO SOLID D: Depende de abstracción, no de implementación concreta
                    const contratoId = await this.contratoRepository.create(contrato);

                    // ===== OPERACIÓN 2: ASOCIAR PLAN AL CLIENTE =====
                    // PATRÓN: Repository - Abstrae la operación de asociación
                    // BUENA PRÁCTICA: Mantener consistencia bidireccional
                    await this.clienteRepository.addPlanToClient(clienteId, planId);

                    // ===== OPERACIÓN 3: ASOCIAR CLIENTE AL PLAN =====
                    // PATRÓN: Repository - Abstrae la operación de asociación
                    // BUENA PRÁCTICA: Mantener consistencia bidireccional
                    await this.planRepository.addClientToPlan(planId, clienteId);

                    // ===== CONSTRUCCIÓN DE RESPUESTA =====
                    // PATRÓN: Data Transfer Object (DTO) - Objeto estructurado para transferencia
                    resultado = {
                        success: true, // Indicador de éxito de la operación
                        contratoId, // ID del contrato creado
                        mensaje: 'Plan asociado exitosamente al cliente' // Mensaje descriptivo
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
            throw new Error(`Error al asociar plan al cliente: ${error.message}`);
        }
    }

    /**
     * Desasocia un plan de un cliente y cancela el contrato
     * @param {string|ObjectId} clienteId - ID del cliente
     * @param {string|ObjectId} planId - ID del plan
     * @param {boolean} forzar - Si debe forzar la desasociación
     * @returns {Promise<Object>} Resultado de la operación
     * 
     * PATRÓN: Template Method - Define el flujo estándar de desasociación de planes
     * PATRÓN: Data Transfer Object (DTO) - Retorna objeto estructurado
     * PATRÓN: Guard Clause - Validaciones tempranas
     * PATRÓN: Transaction - Maneja transacciones para operaciones críticas
     * PATRÓN: Rollback - Manejo de rollback en desasociaciones
     * PATRÓN: Circuit Breaker - Manejo de errores en rollback
     * PRINCIPIO SOLID S: Responsabilidad Única - Solo se encarga de desasociar planes de clientes
     * PRINCIPIO SOLID O: Abierto/Cerrado - Extensible para nuevas validaciones
     * 
     * TRANSACCIONES: Este método implementa transacciones explícitas con rollback
     * INICIO TRANSACCIÓN: Línea 147 - session.startSession()
     * FIN TRANSACCIÓN: Línea 192 - session.endSession()
     * OPERACIONES EN TRANSACCIÓN: Cancelación de contrato, desasociaciones, rollback de seguimientos
     */
    async desasociarPlanDeCliente(clienteId, planId, forzar = false) {
        try {
            // ===== VALIDACIONES DE ENTRADA =====
            // PATRÓN: Guard Clause - Validación temprana de IDs
            // PRINCIPIO SOLID S: Responsabilidad de validación de entrada
            if (!ObjectId.isValid(clienteId) || !ObjectId.isValid(planId)) {
                throw new Error('IDs de cliente y plan deben ser ObjectIds válidos');
            }

            // ===== VALIDACIÓN DE EXISTENCIA DE CLIENTE =====
            // PATRÓN: Repository - Consulta de existencia a través de abstracción
            // PRINCIPIO SOLID D: Depende de abstracción ClienteRepository
            const cliente = await this.clienteRepository.getById(clienteId);
            // PATRÓN: Guard Clause - Validación de existencia del cliente
            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }

            // ===== VALIDACIÓN DE EXISTENCIA DE PLAN =====
            // PATRÓN: Repository - Consulta de existencia a través de abstracción
            // PRINCIPIO SOLID D: Depende de abstracción PlanEntrenamientoRepository
            const plan = await this.planRepository.getById(planId);
            // PATRÓN: Guard Clause - Validación de existencia del plan
            if (!plan) {
                throw new Error('Plan no encontrado');
            }

            // ===== VALIDACIÓN DE ASIGNACIÓN =====
            // PATRÓN: Guard Clause - Validación de asignación del plan
            // PRINCIPIO SOLID S: Responsabilidad de validación de reglas de negocio
            const clienteTienePlan = await this.clienteRepository.clientHasPlan(clienteId, planId);
            if (!clienteTienePlan) {
                throw new Error('El cliente no tiene este plan asignado');
            }

            // ===== VALIDACIÓN DE CONTRATOS ACTIVOS =====
            // PATRÓN: Repository - Consulta de contratos activos
            // PRINCIPIO SOLID D: Depende de abstracción ContratoRepository
            const contratosActivos = await this.contratoRepository.getActiveContractsByClient(clienteId);
            const contratoDelPlan = contratosActivos.find(c => c.planId.toString() === planId.toString());

            // PATRÓN: Guard Clause - Validación de contrato activo
            // PRINCIPIO SOLID S: Responsabilidad de validación de reglas de negocio
            if (contratoDelPlan && !forzar) {
                throw new Error('El cliente tiene un contrato activo con este plan. Use la opción de forzar para cancelar el contrato.');
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
                    // PATRÓN: Strategy - Diferentes estrategias según existencia de contrato
                    // PATRÓN: Repository - Abstrae la operación de cancelación
                    // PRINCIPIO SOLID D: Depende de abstracción, no de implementación concreta
                    if (contratoDelPlan) {
                        await this.contratoRepository.cancelContract(contratoDelPlan.contratoId);
                    }

                    // ===== OPERACIÓN 2: DESASOCIAR PLAN DEL CLIENTE =====
                    // PATRÓN: Repository - Abstrae la operación de desasociación
                    // BUENA PRÁCTICA: Mantener consistencia bidireccional
                    await this.clienteRepository.removePlanFromClient(clienteId, planId);

                    // ===== OPERACIÓN 3: DESASOCIAR CLIENTE DEL PLAN =====
                    // PATRÓN: Repository - Abstrae la operación de desasociación
                    // BUENA PRÁCTICA: Mantener consistencia bidireccional
                    await this.planRepository.removeClientFromPlan(planId, clienteId);

                    // ===== OPERACIÓN 4: ROLLBACK DE SEGUIMIENTOS =====
                    // PATRÓN: Rollback - Eliminación de seguimientos con rollback
                    // PATRÓN: Circuit Breaker - Manejo de errores en rollback
                    // PATRÓN: Repository - Acceso a datos a través de abstracción
                    const { SeguimientoRepository } = require('../repositories');
                    const seguimientoRepository = new SeguimientoRepository(this.db);
                    
                    try {
                        // PATRÓN: Rollback - Eliminación con registro de rollback
                        const rollbackSeguimientos = await seguimientoRepository.deleteFollowUpsByClientWithRollback(
                            clienteId, 
                            `Desasociación de plan: ${plan.nombre}`
                        );
                        
                        // PATRÓN: Guard Clause - Validación de resultado de rollback
                        if (rollbackSeguimientos.success && rollbackSeguimientos.eliminados > 0) {
                            console.log(`✅ Rollback completado: ${rollbackSeguimientos.eliminados} seguimientos eliminados`);
                        }
                    } catch (rollbackError) {
                        // ===== MANEJO DE ERRORES EN ROLLBACK =====
                        // PATRÓN: Circuit Breaker - No fallar la transacción por errores de rollback
                        // BUENA PRÁCTICA: Registrar errores pero no fallar la operación principal
                        console.log(`⚠️ Error en rollback de seguimientos: ${rollbackError.message}`);
                    }

                    // ===== CONSTRUCCIÓN DE RESPUESTA =====
                    // PATRÓN: Data Transfer Object (DTO) - Objeto estructurado para transferencia
                    resultado = {
                        success: true, // Indicador de éxito de la operación
                        mensaje: 'Plan desasociado exitosamente del cliente con rollback de seguimientos', // Mensaje descriptivo
                        contratoCancelado: !!contratoDelPlan // Indicador de si se canceló un contrato
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
            throw new Error(`Error al desasociar plan del cliente: ${error.message}`);
        }
    }

    /**
     * Obtiene todos los planes de un cliente
     * @param {string|ObjectId} clienteId - ID del cliente
     * @returns {Promise<Object>} Planes del cliente con información de contratos
     */
    async obtenerPlanesDelCliente(clienteId) {
        try {
            if (!ObjectId.isValid(clienteId)) {
                throw new Error('ID del cliente no es válido');
            }

            // Obtener cliente
            const cliente = await this.clienteRepository.getById(clienteId);
            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }

            // Obtener planes del cliente
            const planes = await this.clienteRepository.getClientPlans(clienteId);

            // Obtener contratos activos del cliente
            const contratosActivos = await this.contratoRepository.getActiveContractsByClient(clienteId);

            // Combinar información
            const planesConContratos = planes.map(plan => {
                const contrato = contratosActivos.find(c => c.planId.toString() === plan.planId.toString());
                return {
                    planId: plan.planId,
                    nombre: plan.nombre,
                    duracionSemanas: plan.duracionSemanas,
                    duracionMeses: Math.round(plan.duracionSemanas / 4.33),
                    nivel: plan.nivel,
                    estado: plan.estado,
                    cantidadClientes: 0, // Se calculará después
                    metasFisicas: plan.metasFisicas,
                    contrato: contrato ? contrato.getResumen() : null,
                    tieneContratoActivo: !!contrato
                };
            });

            return {
                success: true,
                data: planesConContratos,
                total: planesConContratos.length
            };

        } catch (error) {
            throw new Error(`Error al obtener planes del cliente: ${error.message}`);
        }
    }

    /**
     * Obtiene planes disponibles para un cliente (compatibles con su nivel)
     * @param {string|ObjectId} clienteId - ID del cliente
     * @returns {Promise<Object>} Planes disponibles
     */
    async obtenerPlanesDisponiblesParaCliente(clienteId) {
        try {
            if (!ObjectId.isValid(clienteId)) {
                throw new Error('ID del cliente no es válido');
            }

            // Obtener cliente
            const cliente = await this.clienteRepository.getById(clienteId);
            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }

            // Obtener todos los planes activos
            const planesActivos = await this.planRepository.getActivePlans();

            // Obtener planes ya asignados al cliente
            const planesDelCliente = await this.clienteRepository.getClientPlans(clienteId);
            const idsPlanesAsignados = planesDelCliente.map(p => p.planId.toString());

            // Filtrar planes compatibles y no asignados
            const planesDisponibles = planesActivos.filter(plan => {
                const esCompatible = plan.esCompatibleConNivel(cliente.nivel);
                const noEstaAsignado = !idsPlanesAsignados.includes(plan.planId.toString());
                return esCompatible && noEstaAsignado;
            });

            return {
                success: true,
                data: planesDisponibles.map(plan => plan.getResumen()),
                total: planesDisponibles.length
            };

        } catch (error) {
            throw new Error(`Error al obtener planes disponibles: ${error.message}`);
        }
    }

    /**
     * Renueva un contrato existente
     * @param {string|ObjectId} contratoId - ID del contrato
     * @param {number} mesesAdicionales - Meses a agregar
     * @returns {Promise<Object>} Resultado de la operación
     */
    async renovarContrato(contratoId, mesesAdicionales) {
        try {
            if (!ObjectId.isValid(contratoId)) {
                throw new Error('ID del contrato no es válido');
            }

            if (typeof mesesAdicionales !== 'number' || mesesAdicionales <= 0) {
                throw new Error('Meses adicionales debe ser un número positivo');
            }

            // Obtener contrato
            const contrato = await this.contratoRepository.getById(contratoId);
            if (!contrato) {
                throw new Error('Contrato no encontrado');
            }

            if (!contrato.estaVigente()) {
                throw new Error('Solo se pueden renovar contratos vigentes');
            }

            // Extender contrato
            const resultado = await this.contratoRepository.extendContract(contratoId, mesesAdicionales);

            if (resultado) {
                return {
                    success: true,
                    mensaje: `Contrato renovado por ${mesesAdicionales} meses adicionales`
                };
            } else {
                throw new Error('No se pudo renovar el contrato');
            }

        } catch (error) {
            throw new Error(`Error al renovar contrato: ${error.message}`);
        }
    }

    /**
     * Obtiene estadísticas de planes del cliente
     * @param {string|ObjectId} clienteId - ID del cliente
     * @returns {Promise<Object>} Estadísticas
     */
    async obtenerEstadisticasPlanesCliente(clienteId) {
        try {
            if (!ObjectId.isValid(clienteId)) {
                throw new Error('ID del cliente no es válido');
            }

            // Obtener planes del cliente
            const resultadoPlanes = await this.obtenerPlanesDelCliente(clienteId);
            const planes = resultadoPlanes.data;

            // Obtener contratos del cliente
            const contratosActivos = await this.contratoRepository.getActiveContractsByClient(clienteId);
            const todosLosContratos = await this.contratoRepository.getAll({ clienteId: new ObjectId(clienteId) });

            // Calcular estadísticas
            const estadisticas = {
                totalPlanes: planes.length,
                planesConContratoActivo: planes.filter(p => p.tieneContratoActivo).length,
                planesSinContrato: planes.filter(p => !p.tieneContratoActivo).length,
                contratosActivos: contratosActivos.length,
                contratosCancelados: todosLosContratos.filter(c => c.estado === 'cancelado').length,
                contratosFinalizados: todosLosContratos.filter(c => c.estado === 'finalizado').length,
                totalInvertido: todosLosContratos.reduce((sum, c) => sum + c.precio, 0),
                promedioDuracion: todosLosContratos.length > 0 
                    ? todosLosContratos.reduce((sum, c) => sum + c.duracionMeses, 0) / todosLosContratos.length 
                    : 0
            };

            return {
                success: true,
                data: estadisticas
            };

        } catch (error) {
            throw new Error(`Error al obtener estadísticas: ${error.message}`);
        }
    }
}

// ===== EXPORTACIÓN DEL MÓDULO =====
// PATRÓN: Module Pattern - Exporta la clase como módulo
// PRINCIPIO SOLID S: Responsabilidad de proporcionar la interfaz pública del servicio
module.exports = PlanClienteService;
