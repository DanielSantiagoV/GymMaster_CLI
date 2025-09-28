const ClienteRepository = require('../repositories/ClienteRepository');
const PlanEntrenamientoRepository = require('../repositories/PlanEntrenamientoRepository');
const ContratoRepository = require('../repositories/ContratoRepository');
const SeguimientoRepository = require('../repositories/SeguimientoRepository');
const NutricionRepository = require('../repositories/NutricionRepository');

/**
 * Servicio Cliente Integrado - Obtiene información completa del cliente
 * Incluye planes de entrenamiento, contratos, seguimientos y planes nutricionales
 */
class ClienteIntegradoService {
    constructor(db) {
        this.db = db;
        this.clienteRepository = new ClienteRepository(db);
        this.planEntrenamientoRepository = new PlanEntrenamientoRepository(db);
        this.contratoRepository = new ContratoRepository(db);
        this.seguimientoRepository = new SeguimientoRepository(db);
        this.nutricionRepository = new NutricionRepository(db);
    }

    /**
     * Obtiene información completa de un cliente
     * @param {string} clienteId - ID del cliente
     * @returns {Promise<Object>} Información completa del cliente
     */
    async obtenerClienteCompleto(clienteId) {
        try {
            // Obtener información básica del cliente
            const cliente = await this.clienteRepository.getById(clienteId);
            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }

            // Obtener contratos del cliente
            const contratos = await this.contratoRepository.getByClient(clienteId);
            
            // Obtener planes de entrenamiento asignados
            const planesAsignados = await this.obtenerPlanesAsignados(contratos);
            
            // Obtener seguimientos físicos del cliente
            const seguimientos = await this.seguimientoRepository.getByClient(clienteId);
            
            // Obtener planes nutricionales del cliente
            const planesNutricionales = await this.nutricionRepository.getByClient(clienteId);
            
            // Obtener plan nutricional activo
            const planNutricionalActivo = await this.nutricionRepository.getActiveByClient(clienteId);

            return {
                cliente: cliente.getResumen(),
                contratos: contratos.map(contrato => ({
                    contratoId: contrato.contratoId.toString(),
                    planId: contrato.planId.toString(),
                    fechaInicio: contrato.fechaInicio,
                    fechaFin: contrato.fechaFin,
                    precio: contrato.precio,
                    estado: contrato.estado,
                    duracionMeses: contrato.duracionMeses
                })),
                planesAsignados: planesAsignados,
                seguimientos: seguimientos.map(seguimiento => ({
                    seguimientoId: seguimiento.seguimientoId.toString(),
                    fecha: seguimiento.fecha,
                    peso: seguimiento.peso,
                    grasaCorporal: seguimiento.grasaCorporal,
                    medidas: seguimiento.medidas,
                    comentarios: seguimiento.comentarios
                })),
                planesNutricionales: planesNutricionales.map(plan => ({
                    nutricionId: plan.nutricionId.toString(),
                    tipoPlan: plan.getTipoPlanDescripcion(),
                    estado: plan.estado,
                    fechaCreacion: plan.fechaCreacion,
                    detallePlan: plan.detallePlan.substring(0, 100) + (plan.detallePlan.length > 100 ? '...' : '')
                })),
                planNutricionalActivo: planNutricionalActivo ? {
                    nutricionId: planNutricionalActivo.nutricionId.toString(),
                    tipoPlan: planNutricionalActivo.getTipoPlanDescripcion(),
                    fechaCreacion: planNutricionalActivo.fechaCreacion
                } : null,
                estadisticas: {
                    totalContratos: contratos.length,
                    contratosActivos: contratos.filter(c => c.estado === 'vigente').length,
                    totalSeguimientos: seguimientos.length,
                    totalPlanesNutricionales: planesNutricionales.length,
                    planesNutricionalesActivos: planesNutricionales.filter(p => p.estado === 'activo').length
                }
            };
        } catch (error) {
            throw new Error(`Error al obtener cliente completo: ${error.message}`);
        }
    }

    /**
     * Obtiene los planes de entrenamiento asignados a un cliente
     * @param {Array} contratos - Contratos del cliente
     * @returns {Promise<Array>} Planes de entrenamiento asignados
     */
    async obtenerPlanesAsignados(contratos) {
        try {
            const planesAsignados = [];
            
            for (const contrato of contratos) {
                const plan = await this.planEntrenamientoRepository.getById(contrato.planId);
                if (plan) {
                    planesAsignados.push({
                        planId: plan.planId.toString(),
                        nombre: plan.nombre,
                        descripcion: plan.descripcion,
                        nivel: plan.nivel,
                        duracion: plan.duracion,
                        estado: plan.estado,
                        contratoId: contrato.contratoId.toString(),
                        fechaInicio: contrato.fechaInicio,
                        fechaFin: contrato.fechaFin,
                        estadoContrato: contrato.estado
                    });
                }
            }
            
            return planesAsignados;
        } catch (error) {
            throw new Error(`Error al obtener planes asignados: ${error.message}`);
        }
    }

    /**
     * Lista todos los clientes con información completa
     * @param {Object} filtros - Filtros opcionales
     * @returns {Promise<Object>} Lista de clientes con información completa
     */
    async listarClientesCompletos(filtros = {}) {
        try {
            const clientes = await this.clienteRepository.getAll(filtros);
            const clientesCompletos = [];

            for (const cliente of clientes) {
                try {
                    const clienteCompleto = await this.obtenerClienteCompleto(cliente.clienteId);
                    clientesCompletos.push(clienteCompleto);
                } catch (error) {
                    console.log(`⚠️ Error al obtener información completa del cliente ${cliente.clienteId}: ${error.message}`);
                    // Agregar cliente básico si hay error
                    clientesCompletos.push({
                        cliente: cliente.getResumen(),
                        contratos: [],
                        planesAsignados: [],
                        seguimientos: [],
                        planesNutricionales: [],
                        planNutricionalActivo: null,
                        estadisticas: {
                            totalContratos: 0,
                            contratosActivos: 0,
                            totalSeguimientos: 0,
                            totalPlanesNutricionales: 0,
                            planesNutricionalesActivos: 0
                        }
                    });
                }
            }

            return {
                success: true,
                data: clientesCompletos,
                total: clientesCompletos.length
            };
        } catch (error) {
            throw new Error(`Error al listar clientes completos: ${error.message}`);
        }
    }

    /**
     * Obtiene estadísticas generales del sistema
     * @returns {Promise<Object>} Estadísticas del sistema
     */
    async obtenerEstadisticasGenerales() {
        try {
            const clientes = await this.clienteRepository.getAll();
            const planes = await this.planEntrenamientoRepository.getAll();
            const contratos = await this.contratoRepository.getAll();
            const seguimientos = await this.seguimientoRepository.getAll();
            const planesNutricionales = await this.nutricionRepository.getAll();

            return {
                clientes: {
                    total: clientes.length,
                    activos: clientes.filter(c => c.activo).length,
                    inactivos: clientes.filter(c => !c.activo).length
                },
                planes: {
                    total: planes.length,
                    activos: planes.filter(p => p.estado === 'activo').length,
                    inactivos: planes.filter(p => p.estado === 'inactivo').length
                },
                contratos: {
                    total: contratos.length,
                    vigentes: contratos.filter(c => c.estado === 'vigente').length,
                    vencidos: contratos.filter(c => c.estado === 'vencido').length,
                    cancelados: contratos.filter(c => c.estado === 'cancelado').length
                },
                seguimientos: {
                    total: seguimientos.length,
                    esteMes: seguimientos.filter(s => {
                        const fecha = new Date(s.fecha);
                        const ahora = new Date();
                        return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
                    }).length
                },
                planesNutricionales: {
                    total: planesNutricionales.length,
                    activos: planesNutricionales.filter(p => p.estado === 'activo').length,
                    pausados: planesNutricionales.filter(p => p.estado === 'pausado').length,
                    finalizados: planesNutricionales.filter(p => p.estado === 'finalizado').length
                }
            };
        } catch (error) {
            throw new Error(`Error al obtener estadísticas generales: ${error.message}`);
        }
    }
}

module.exports = ClienteIntegradoService;
