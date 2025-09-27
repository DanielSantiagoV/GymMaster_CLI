const { ObjectId } = require('mongodb');
const { PlanEntrenamiento } = require('../models');
const { Contrato } = require('../models');
const PlanEntrenamientoRepository = require('../repositories/PlanEntrenamientoRepository');
const ContratoRepository = require('../repositories/ContratoRepository');
const ClienteRepository = require('../repositories/ClienteRepository');

/**
 * Servicio para gestión de planes de clientes
 * Implementa lógica de negocio para asociar/desasociar planes con clientes
 * Maneja generación automática de contratos y transacciones
 */
class PlanClienteService {
    constructor(db) {
        this.db = db;
        this.planRepository = new PlanEntrenamientoRepository(db);
        this.contratoRepository = new ContratoRepository(db);
        this.clienteRepository = new ClienteRepository(db);
    }

    /**
     * Asocia un plan a un cliente y genera contrato automáticamente
     * @param {string|ObjectId} clienteId - ID del cliente
     * @param {string|ObjectId} planId - ID del plan
     * @param {Object} datosContrato - Datos del contrato (precio, duración, condiciones)
     * @returns {Promise<Object>} Resultado de la operación
     */
    async asociarPlanACliente(clienteId, planId, datosContrato) {
        try {
            // Validar IDs
            if (!ObjectId.isValid(clienteId) || !ObjectId.isValid(planId)) {
                throw new Error('IDs de cliente y plan deben ser ObjectIds válidos');
            }

            // Verificar que el cliente existe
            const cliente = await this.clienteRepository.getById(clienteId);
            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }

            // Verificar que el plan existe
            const plan = await this.planRepository.getById(planId);
            if (!plan) {
                throw new Error('Plan no encontrado');
            }

            // Verificar que el plan está activo
            if (!plan.estaActivo()) {
                throw new Error('Solo se pueden asignar planes activos');
            }

            // Verificar compatibilidad de nivel
            if (!plan.esCompatibleConNivel(cliente.nivel)) {
                throw new Error(`El plan no es compatible con el nivel del cliente (${cliente.nivel})`);
            }

            // Verificar que no existe un contrato activo para este cliente y plan
            const contratosExistentes = await this.contratoRepository.getContractsByClientAndPlan(clienteId, planId);
            const contratoActivo = contratosExistentes.find(c => c.estado === 'vigente');
            if (contratoActivo) {
                throw new Error('Ya existe un contrato activo para este cliente y plan');
            }

            // Iniciar transacción para operaciones críticas
            const session = this.db.client.startSession();
            
            try {
                let resultado;
                
                await session.withTransaction(async () => {
                    // 1. Crear el contrato
                    const contrato = new Contrato({
                        clienteId: new ObjectId(clienteId),
                        planId: new ObjectId(planId),
                        condiciones: datosContrato.condiciones || `Contrato automático para ${plan.nombre}`,
                        duracionMeses: datosContrato.duracionMeses || 1,
                        precio: datosContrato.precio || 0,
                        fechaInicio: new Date()
                    });

                    const contratoId = await this.contratoRepository.create(contrato);

                    // 2. Agregar el plan al cliente
                    await this.clienteRepository.addPlanToClient(clienteId, planId);

                    // 3. Agregar el cliente al plan
                    await this.planRepository.addClientToPlan(planId, clienteId);

                    resultado = {
                        success: true,
                        contratoId,
                        mensaje: 'Plan asociado exitosamente al cliente'
                    };
                });

                return resultado;
            } finally {
                await session.endSession();
            }

        } catch (error) {
            throw new Error(`Error al asociar plan al cliente: ${error.message}`);
        }
    }

    /**
     * Desasocia un plan de un cliente y cancela el contrato
     * @param {string|ObjectId} clienteId - ID del cliente
     * @param {string|ObjectId} planId - ID del plan
     * @param {boolean} forzar - Si debe forzar la desasociación
     * @returns {Promise<Object>} Resultado de la operación
     */
    async desasociarPlanDeCliente(clienteId, planId, forzar = false) {
        try {
            // Validar IDs
            if (!ObjectId.isValid(clienteId) || !ObjectId.isValid(planId)) {
                throw new Error('IDs de cliente y plan deben ser ObjectIds válidos');
            }

            // Verificar que el cliente existe
            const cliente = await this.clienteRepository.getById(clienteId);
            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }

            // Verificar que el plan existe
            const plan = await this.planRepository.getById(planId);
            if (!plan) {
                throw new Error('Plan no encontrado');
            }

            // Verificar que el cliente tiene el plan asignado
            const clienteTienePlan = await this.clienteRepository.clientHasPlan(clienteId, planId);
            if (!clienteTienePlan) {
                throw new Error('El cliente no tiene este plan asignado');
            }

            // Obtener contratos activos
            const contratosActivos = await this.contratoRepository.getActiveContractsByClient(clienteId);
            const contratoDelPlan = contratosActivos.find(c => c.planId.toString() === planId.toString());

            if (contratoDelPlan && !forzar) {
                throw new Error('El cliente tiene un contrato activo con este plan. Use la opción de forzar para cancelar el contrato.');
            }

            // Iniciar transacción para rollback
            const session = this.db.client.startSession();
            
            try {
                let resultado;
                
                await session.withTransaction(async () => {
                    // 1. Cancelar contrato si existe
                    if (contratoDelPlan) {
                        await this.contratoRepository.cancelContract(contratoDelPlan.contratoId);
                    }

                    // 2. Remover el plan del cliente
                    await this.clienteRepository.removePlanFromClient(clienteId, planId);

                    // 3. Remover el cliente del plan
                    await this.planRepository.removeClientFromPlan(planId, clienteId);

                    resultado = {
                        success: true,
                        mensaje: 'Plan desasociado exitosamente del cliente',
                        contratoCancelado: !!contratoDelPlan
                    };
                });

                return resultado;
            } finally {
                await session.endSession();
            }

        } catch (error) {
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

module.exports = PlanClienteService;
