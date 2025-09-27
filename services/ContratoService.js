const { ObjectId } = require('mongodb');
const { Contrato } = require('../models');
const ContratoRepository = require('../repositories/ContratoRepository');
const ClienteRepository = require('../repositories/ClienteRepository');
const PlanEntrenamientoRepository = require('../repositories/PlanEntrenamientoRepository');
const FinanzasRepository = require('../repositories/FinanzasRepository');

/**
 * Servicio para gestión de contratos
 * Implementa lógica de negocio para contratos siguiendo principios SOLID
 * Maneja validaciones, transacciones y coordinación con otros módulos
 */
class ContratoService {
    constructor(db) {
        this.db = db;
        this.contratoRepository = new ContratoRepository(db);
        this.clienteRepository = new ClienteRepository(db);
        this.planRepository = new PlanEntrenamientoRepository(db);
        this.finanzasRepository = new FinanzasRepository(db);
    }

    /**
     * Crea un nuevo contrato con validaciones de negocio
     * @param {Object} datosContrato - Datos del contrato a crear
     * @returns {Promise<Object>} Resultado de la operación
     */
    async crearContrato(datosContrato) {
        try {
            // Validar que cliente y plan existen y están activos
            const cliente = await this.clienteRepository.getById(datosContrato.clienteId);
            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }

            const plan = await this.planRepository.getById(datosContrato.planId);
            if (!plan) {
                throw new Error('Plan no encontrado');
            }

            if (!plan.estaActivo()) {
                throw new Error('Solo se pueden crear contratos con planes activos');
            }

            // Verificar que no existe un contrato vigente para este cliente y plan
            const contratosExistentes = await this.contratoRepository.getContractsByClientAndPlan(
                datosContrato.clienteId, 
                datosContrato.planId
            );
            const contratoVigente = contratosExistentes.find(c => c.estado === 'vigente');
            if (contratoVigente) {
                throw new Error('Ya existe un contrato vigente para este cliente y plan');
            }

            // Validar fechas
            this.validarFechasContrato(datosContrato.fechaInicio, datosContrato.fechaFin);

            // Validar precio
            if (!datosContrato.precio || datosContrato.precio <= 0) {
                throw new Error('El precio debe ser mayor a cero');
            }

            // Crear instancia del contrato
            const contrato = new Contrato({
                clienteId: datosContrato.clienteId,
                planId: datosContrato.planId,
                condiciones: datosContrato.condiciones || '',
                duracionMeses: datosContrato.duracionMeses,
                precio: datosContrato.precio,
                fechaInicio: datosContrato.fechaInicio,
                fechaFin: datosContrato.fechaFin
            });

            // Iniciar transacción para operaciones críticas
            const session = this.db.client.startSession();
            
            try {
                let resultado;
                
                await session.withTransaction(async () => {
                    // 1. Crear el contrato
                    const contratoId = await this.contratoRepository.create(contrato);

                    // 2. Asociar el plan al cliente
                    await this.clienteRepository.addPlanToClient(datosContrato.clienteId, datosContrato.planId);

                    // 3. Asociar el cliente al plan
                    await this.planRepository.addClientToPlan(datosContrato.planId, datosContrato.clienteId);

                    // 4. Registrar ingreso financiero si se especifica
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

                    resultado = {
                        success: true,
                        contratoId: contratoId,
                        mensaje: 'Contrato creado exitosamente'
                    };
                });

                return resultado;
            } finally {
                await session.endSession();
            }

        } catch (error) {
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
     */
    async cancelarContrato(contratoId, motivo = '') {
        try {
            const contrato = await this.contratoRepository.getById(contratoId);
            if (!contrato) {
                throw new Error('Contrato no encontrado');
            }

            if (contrato.estado === 'cancelado') {
                throw new Error('El contrato ya está cancelado');
            }

            if (contrato.estado === 'renovado') {
                throw new Error('No se puede cancelar un contrato renovado');
            }

            // Iniciar transacción para rollback
            const session = this.db.client.startSession();
            
            try {
                let resultado;
                
                await session.withTransaction(async () => {
                    // 1. Cancelar el contrato
                    await this.contratoRepository.update(contratoId, { 
                        estado: 'cancelado',
                        motivoCancelacion: motivo
                    });

                    // 2. Desasociar el plan del cliente
                    await this.clienteRepository.removePlanFromClient(contrato.clienteId, contrato.planId);

                    // 3. Desasociar el cliente del plan
                    await this.planRepository.removeClientFromPlan(contrato.planId, contrato.clienteId);

                    resultado = {
                        success: true,
                        mensaje: 'Contrato cancelado exitosamente'
                    };
                });

                return resultado;
            } finally {
                await session.endSession();
            }

        } catch (error) {
            throw new Error(`Error al cancelar contrato: ${error.message}`);
        }
    }

    /**
     * Renueva un contrato
     * @param {string|ObjectId} contratoId - ID del contrato a renovar
     * @param {Object} datosRenovacion - Datos de la renovación
     * @returns {Promise<Object>} Resultado de la operación
     */
    async renovarContrato(contratoId, datosRenovacion) {
        try {
            const contrato = await this.contratoRepository.getById(contratoId);
            if (!contrato) {
                throw new Error('Contrato no encontrado');
            }

            if (contrato.estado !== 'vigente' && contrato.estado !== 'vencido') {
                throw new Error('Solo se pueden renovar contratos vigentes o vencidos');
            }

            // Validar fechas de renovación
            this.validarFechasContrato(datosRenovacion.fechaInicio, datosRenovacion.fechaFin);

            // Validar precio
            if (!datosRenovacion.precio || datosRenovacion.precio <= 0) {
                throw new Error('El precio debe ser mayor a cero');
            }

            // Iniciar transacción para renovación
            const session = this.db.client.startSession();
            
            try {
                let resultado;
                
                await session.withTransaction(async () => {
                    // 1. Marcar contrato anterior como renovado
                    await this.contratoRepository.update(contratoId, { 
                        estado: 'renovado',
                        fechaRenovacion: new Date()
                    });

                    // 2. Crear nuevo contrato
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

                    const nuevoContratoId = await this.contratoRepository.create(nuevoContrato);

                    resultado = {
                        success: true,
                        contratoId: nuevoContratoId,
                        mensaje: 'Contrato renovado exitosamente'
                    };
                });

                return resultado;
            } finally {
                await session.endSession();
            }

        } catch (error) {
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
     * Valida las fechas de un contrato
     * @param {Date} fechaInicio - Fecha de inicio
     * @param {Date} fechaFin - Fecha de fin
     * @throws {Error} Si las fechas no son válidas
     */
    validarFechasContrato(fechaInicio, fechaFin) {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        const hoy = new Date();

        if (inicio >= fin) {
            throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
        }

        if (fin <= hoy) {
            throw new Error('La fecha de fin debe ser futura');
        }
    }
}

module.exports = ContratoService;
